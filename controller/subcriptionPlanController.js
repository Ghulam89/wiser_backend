const db = require("../models/index.js");
const SubscriptionPlan = db.subcriptionPlan
const { Op } = require("sequelize");

const getAllPlans = async (req, res) => {
  try {
    const search = req.query.search || "";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const { tier, level } = req.query;

    const whereCondition = {
      [Op.or]: [
        { planName: { [Op.like]: `%${search}%` } },
        { '$legalAssistance.features$': { [Op.like]: `%${search}%` } }
      ]
    };

    // Add filters if provided
    if (tier) whereCondition.tier = tier;
    if (level) whereCondition.level = level;

    const plans = await SubscriptionPlan.findAll({
      where: whereCondition,
      limit: limit,
      offset: (page - 1) * limit,
      order: [['displayOrder', 'ASC']]
    });

    const count = await SubscriptionPlan.count({
      where: whereCondition
    });

    res.status(200).json({
      status: "success",
      data: plans,
      meta: {
        search,
        page,
        count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        limit
      }
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message
    });
  }
};

const createPlan = async (req, res) => {
  try {
    const { planName, tier, level, monthlyPriceBHD, monthlyPriceUSD, legalAssistance, support24_7 } = req.body;

    if (!planName || !tier || !level || !monthlyPriceBHD || !monthlyPriceUSD) {
      return res.status(400).json({
        status: "fail",
        message: "Required fields are missing"
      });
    }

    // Validate legalAssistance and support24_7 are valid JSON if provided
    try {
      if (legalAssistance) JSON.parse(legalAssistance);
      if (support24_7) JSON.parse(support24_7);
    } catch (e) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid JSON format for legalAssistance or support24_7"
      });
    }

    const existingPlan = await SubscriptionPlan.findOne({
      where: { 
        [Op.and]: [
          { tier },
          { level }
        ]
      }
    });

    if (existingPlan) {
      return res.status(400).json({
        status: "fail",
        message: "Subscription plan with this tier and level already exists"
      });
    }

    const newPlan = await SubscriptionPlan.create({
      planName,
      tier,
      level,
      monthlyPriceBHD,
      monthlyPriceUSD,
      legalAssistance: legalAssistance ? JSON.parse(legalAssistance) : {},
      support24_7: support24_7 ? JSON.parse(support24_7) : {},
      displayOrder: req.body.displayOrder || 0
    });

    res.status(201).json({
      status: "success",
      message: "Subscription plan created successfully",
      data: newPlan
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message
    });
  }
};

const getPlanById = async (req, res) => {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({
        status: "fail",
        message: "Plan ID is required"
      });
    }

    const plan = await SubscriptionPlan.findByPk(id);
    
    if (!plan) {
      return res.status(404).json({
        status: "fail",
        message: "Subscription plan not found"
      });
    }

    res.status(200).json({
      status: "success",
      data: plan
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message
    });
  }
};

const updatePlan = async (req, res) => {
  try {
    const { id } = req.query;
    const updateData = req.body;

    if (!id) {
      return res.status(400).json({
        status: "fail",
        message: "Plan ID is required"
      });
    }

    const plan = await SubscriptionPlan.findByPk(id);
    if (!plan) {
      return res.status(404).json({
        status: "fail",
        message: "Subscription plan not found"
      });
    }

    // Handle JSON fields
    if (updateData.legalAssistance) {
      try {
        updateData.legalAssistance = JSON.parse(updateData.legalAssistance);
      } catch (e) {
        return res.status(400).json({
          status: "fail",
          message: "Invalid JSON format for legalAssistance"
        });
      }
    }

    if (updateData.support24_7) {
      try {
        updateData.support24_7 = JSON.parse(updateData.support24_7);
      } catch (e) {
        return res.status(400).json({
          status: "fail",
          message: "Invalid JSON format for support24_7"
        });
      }
    }

    // Check for duplicate tier/level combination if changing
    if (updateData.tier || updateData.level) {
      const newTier = updateData.tier || plan.tier;
      const newLevel = updateData.level || plan.level;
      
      const existingPlan = await SubscriptionPlan.findOne({
        where: {
          [Op.and]: [
            { tier: newTier },
            { level: newLevel },
            { id: { [Op.ne]: id } }
          ]
        }
      });

      if (existingPlan) {
        return res.status(400).json({
          status: "fail",
          message: "Another plan with this tier and level already exists"
        });
      }
    }

    await plan.update(updateData);
    const updatedPlan = await SubscriptionPlan.findByPk(id);

    res.status(200).json({
      status: "success",
      message: "Subscription plan updated successfully",
      data: updatedPlan
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message
    });
  }
};

const deletePlan = async (req, res) => {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({
        status: "fail",
        message: "Plan ID is required"
      });
    }

    const plan = await SubscriptionPlan.findByPk(id);
    if (!plan) {
      return res.status(404).json({
        status: "fail",
        message: "Subscription plan not found"
      });
    }

    await plan.destroy();
    
    res.status(200).json({
      status: "success",
      message: "Subscription plan deleted successfully"
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message
    });
  }
};

module.exports = {
  getAllPlans,
  createPlan,
  getPlanById,
  updatePlan,
  deletePlan
};