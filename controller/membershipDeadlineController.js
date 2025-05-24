
const db = require("../models/index.js");
const MembershipDeadline = db.membershipDeadline;
const { Op } = require("sequelize");

const getAllMemberships = async (req, res) => {
  try {
    const { tier, search } = req.query;
    const whereCondition = { isActive: true };

    if (tier) whereCondition.tier = tier;
    if (search) {
      whereCondition[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { '$features.category$': { [Op.like]: `%${search}%` } },
        { '$features.items$': { [Op.like]: `%${search}%` } }
      ];
    }

    const memberships = await MembershipDeadline.findAll({
      where: whereCondition,
      order: [['displayOrder', 'ASC']]
    });

    res.status(200).json({
      status: "success",
      data: memberships.map(m => ({
        id: m.id,
        name: m.name,
        tier: m.tier,
        features: m.formattedFeatures,
        responseTime: m.responseTime
      }))
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message
    });
  }
};

const createMembership = async (req, res) => {
  try {
    const { name, tier, features, responseTime } = req.body;

    if (!name || !tier) {
      return res.status(400).json({
        status: "fail",
        message: "Name and tier are required"
      });
    }

    // Validate features JSON
    let parsedFeatures = {};
    if (features) {
      try {
        parsedFeatures = typeof features === 'string' ? JSON.parse(features) : features;
      } catch (e) {
        return res.status(400).json({
          status: "fail",
          message: "Invalid features format"
        });
      }
    }

    const newMembership = await MembershipDeadline.create({
      name,
      tier,
      features: parsedFeatures,
      responseTime
    });

    res.status(201).json({
      status: "success",
      message: "Membership created successfully",
      data: newMembership
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message
    });
  }
};

const getMembershipById = async (req, res) => {
  try {
    const { id } = req.query;

    const membership = await MembershipDeadline.findByPk(id);
    if (!membership) {
      return res.status(404).json({
        status: "fail",
        message: "Membership not found"
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        id: membership.id,
        name: membership.name,
        tier: membership.tier,
        features: membership.formattedFeatures,
        responseTime: membership.responseTime
      }
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message
    });
  }
};

const updateMembership = async (req, res) => {
  try {
    const { id } = req.query;
    const updateData = req.body;

    const membership = await MembershipDeadline.findByPk(id);
    if (!membership) {
      return res.status(404).json({
        status: "fail",
        message: "Membership not found"
      });
    }

    // Handle features update
    if (updateData.features) {
      try {
        updateData.features = typeof updateData.features === 'string' 
          ? JSON.parse(updateData.features) 
          : updateData.features;
      } catch (e) {
        return res.status(400).json({
          status: "fail",
          message: "Invalid features format"
        });
      }
    }

    await membership.update(updateData);
    const updatedMembership = await MembershipDeadline.findByPk(id);

    res.status(200).json({
      status: "success",
      message: "Membership updated successfully",
      data: updatedMembership
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message
    });
  }
};

const deleteMembership = async (req, res) => {
  try {
    const { id } = req.query;

    const membership = await MembershipDeadline.findByPk(id);
    if (!membership) {
      return res.status(404).json({
        status: "fail",
        message: "Membership not found"
      });
    }

    await membership.destroy();
    
    res.status(200).json({
      status: "success",
      message: "Membership deleted successfully"
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message
    });
  }
};

module.exports = {
  getAllMemberships,
  createMembership,
  getMembershipById,
  updateMembership,
  deleteMembership
};