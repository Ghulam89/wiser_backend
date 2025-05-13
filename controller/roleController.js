const db = require("../models/index.js");
const { Op } = require("sequelize");
const Role = db.role;


const createData = async (req, res) => {
  try {
   

   
    if (!req.body.name) {
      return res.status(400).json({
        status: "fail",
        message: "Name is required",
      });
    }

 
    let data = await Role.create({
      ...req.body,
     
    });

    res.status(200).json({
      status: "success",
      message: "Role created successfully",
      data:data,
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
};



const getAllData = async (req, res) => {
  try {
    const search = req.query.search || "";
    const page = parseInt(req.query.page) || 1;
    const limit = 20;

    const data = await Role.findAll({
      where: {
        [Op.or]: [{ email: { [Op.like]: `%${search}%` } }],
      },
      limit: limit,
      offset: (page - 1) * limit,
    });

    const count = await Role.count({
      where: {
        [Op.or]: [{ email: { [Op.like]: `%${search}%` } }],
      },
    });

    res.status(200).json({
      status: "ok",
      data: data,
      search,
      page,
      count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      limit,
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
};

const getDataById = async (req, res) => {
  try {
    let id = req.role.id;

    let data = await Role.findOne({
      where: { id: id },
    });
    res.status(200).json({
      status: "ok",
      data: data,
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
};


const updateData = async (req, res) => {
  try {
    let id = req.role.id;
    const idData = await Role.findOne({
      where: { id: id },
    });
    if (!idData) {
      return res.status(404).json({
        message: "Role not found",
        status: "fail",
      });
    }

   
    const updateFields = {
      ...req.body,
     
    };

    const data = await Role.update(updateFields, {
      where: { id: id },
    });

    res.status(200).json({
      status: "ok",
      data: data,
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
};

const deleteData = async (req, res) => {
  try {
    const id = req.role.id;

    const deleted = await Role.destroy({ where: { id } });

    if (deleted === 0) {
      return res.status(404).json({
        status: "fail",
        message: "Role not found",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Role deleted successfully",
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
  createData,
  getAllData,
  getDataById,
  updateData,
  deleteData,
 
};
