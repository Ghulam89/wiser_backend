const db = require("../models/index.js");
const TicketSupport = db.ticketSupport;
const User = db.user;
const Admin = db.admin;
const { Op } = require("sequelize");

const getAllTickets = async (req, res) => {
  try {
    const search = req.query.search || "";
    const status = req.query.status || null;
    const priority = req.query.priority || null;
    const userId = req.query.userId || null;
    const adminId = req.query.adminId || null;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const whereCondition = {
      [Op.or]: [
        { subject: { [Op.like]: `%${search}%` }},
        { description: { [Op.like]: `%${search}%` }},
        { issue: { [Op.like]: `%${search}%` }},
        { ticketNumber: { [Op.like]: `%${search}%` }}
      ]
    };

    if (status) {
      whereCondition.status = status;
    }
    if (priority) {
      whereCondition.priority = priority;
    }
    if (userId) {
      whereCondition.userId = userId;
    }
    if (adminId) {
      whereCondition.adminId = adminId;
    }

    const tickets = await TicketSupport.findAll({
      where: whereCondition,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'fullName', 'email', 'phone']
        },
        {
          model: Admin,
          as: 'admin',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: limit,
      offset: (page - 1) * limit,
    });

    const count = await TicketSupport.count({
      where: whereCondition,
    });

    res.status(200).json({
      status: "success",
      data: tickets,
      search,
      page,
      count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      limit,
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};

const createTicket = async (req, res) => {
  try {
    const { userId, adminId, issue, description, subject, priority,roomId} = req.body;

    if (!userId || !adminId || !issue || !subject) {
      return res.status(400).json({
        status: "fail",
        message: "userId, adminId, issue, and subject are required fields",
      });
    }

    

    // Check if user exists
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid user ID",
      });
    }

    // Check if admin exists
    const admin = await Admin.findByPk(adminId);
    if (!admin) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid admin ID",
      });
    }

    // Generate unique ticket number
    const ticketNumber = `TKT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const ticket = await TicketSupport.create({
      ticketNumber,
      userId,
      adminId,
      roomId,
      issue,
      description: description || null,
      subject,
      priority: priority || 'medium',
      status: 'open'
    });

    res.status(201).json({
      status: "success",
      message: "Ticket created successfully",
      data: ticket,
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};

const getTicketById = async (req, res) => {
  try {
    const id = req.query.id;

    if (!id) {
      return res.status(400).json({
        status: "fail",
        message: "Ticket ID is required",
      });
    }

    const ticket = await TicketSupport.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'fullName', 'email', 'phone']
        },
        {
          model: Admin,
          as: 'admin',
          attributes: ['id', 'name', 'email']
        }
      ]
    });
    
    if (!ticket) {
      return res.status(404).json({
        status: "fail",
        message: "Ticket not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: ticket,
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};

const updateTicket = async (req, res) => {
  try {
    const id = req.query.id;

    if (!id) {
      return res.status(400).json({
        status: "fail",
        message: "Ticket ID is required",
      });
    }

    const ticket = await TicketSupport.findByPk(id);
    if (!ticket) {
      return res.status(404).json({
        status: "fail",
        message: "Ticket not found",
      });
    }

    const updateFields = {
      ...req.body
    };

    // Validate status if being updated
    if (req.body.status && !['open', 'in_progress', 'resolved', 'closed'].includes(req.body.status)) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid status value",
      });
    }

    // Validate priority if being updated
    if (req.body.priority && !['low', 'medium', 'high'].includes(req.body.priority)) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid priority value",
      });
    }

    const [updated] = await TicketSupport.update(updateFields, {
      where: { id: id },
    });

    if (updated === 0) {
      return res.status(400).json({
        status: "fail",
        message: "No changes were made",
      });
    }

    const updatedTicket = await TicketSupport.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'fullName', 'email', 'phone']
        },
        {
          model: Admin,
          as: 'admin',
          attributes: ['id', 'name', 'email']
        }
      ]
    });
    
    res.status(200).json({
      status: "success",
      data: updatedTicket,
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};

const deleteTicket = async (req, res) => {
  try {
    const id = req.query.id;

    if (!id) {
      return res.status(400).json({
        status: "fail",
        message: "Ticket ID is required",
      });
    }

    const deleted = await TicketSupport.destroy({ where: { id } });

    if (deleted === 0) {
      return res.status(404).json({
        status: "fail",
        message: "Ticket not found",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Ticket deleted successfully",
    });
  } catch (err) {
    console.error("Delete error:", err);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

module.exports = {
  getAllTickets,
  createTicket,
  getTicketById,
  updateTicket,
  deleteTicket,
};