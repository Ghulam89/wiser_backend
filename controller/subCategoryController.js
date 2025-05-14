const db = require("../models/index.js");
const SubCategory = db.subCategory;
const Category = db.category;
const { Op } = require("sequelize");

const getAllData = async (req, res) => {
  try {
    const search = req.query.search || "";
    const categoryId = req.query.categoryId || null;
    const page = parseInt(req.query.page) || 1;
    const limit = 20;

    const whereCondition = {
      [Op.or]: [
        { name: { [Op.like]: `%${search}%` }}
      ]
    };

    if (categoryId) {
      whereCondition.categoryId = categoryId;
    }

    const data = await SubCategory.findAll({
      where: whereCondition,
      include: {
        model: Category,
        as: 'category',
        attributes: ['id', 'name']
      },
      limit: limit,
      offset: (page - 1) * limit,
    });

    const count = await SubCategory.count({
      where: whereCondition,
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

const createData = async (req, res) => {
  try {
    const { name, categoryId } = req.body;

    if (!name || !categoryId) {
      return res.status(400).json({
        status: "fail",
        message: "Name and category ID are required",
      });
    }

    const category = await Category.findByPk(categoryId);
    if (!category) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid category ID",
      });
    }

    const existingSubCategory = await SubCategory.findOne({
      where: { name },
    });

    if (existingSubCategory) {
      return res.status(400).json({
        status: "fail",
        message: "Subcategory already exists",
      });
    }

    // Create subcategory
    const subCategory = await SubCategory.create({
      name,
      categoryId
    });

    res.status(201).json({
      status: "success",
      message: "Subcategory created successfully",
      data: subCategory,
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};

const getDataById = async (req, res) => {
  try {
    let id = req.query.id;

    if (!id) {
      return res.status(400).json({
        status: "fail",
        message: "Subcategory ID is required",
      });
    }

    let data = await SubCategory.findByPk(id, {
      include: {
        model: Category,
        as: 'category',
        attributes: ['id', 'name']
      }
    });
    
    if (!data) {
      return res.status(404).json({
        status: "fail",
        message: "Subcategory not found",
      });
    }

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
    let id = req.query.id;

    if (!id) {
      return res.status(400).json({
        status: "fail",
        message: "Subcategory ID is required",
      });
    }

    const subCategory = await SubCategory.findByPk(id);
    if (!subCategory) {
      return res.status(404).json({
        message: "Subcategory not found",
        status: "fail",
      });
    }

    const updateFields = {
      ...req.body
    };

    // If categoryId is being updated, check if it exists
    if (req.body.categoryId && req.body.categoryId !== subCategory.categoryId) {
      const category = await Category.findByPk(req.body.categoryId);
      if (!category) {
        return res.status(400).json({
          status: "fail",
          message: "Invalid category ID",
        });
      }
    }

    // If name is being updated, check if it already exists
    if (req.body.name && req.body.name !== subCategory.name) {
      const existingSubCategory = await SubCategory.findOne({
        where: { name: req.body.name },
      });

      if (existingSubCategory) {
        return res.status(400).json({
          status: "fail",
          message: "Subcategory name already exists",
        });
      }
    }

    const [updated] = await SubCategory.update(updateFields, {
      where: { id: id },
    });

    if (updated === 0) {
      return res.status(400).json({
        status: "fail",
        message: "No changes were made",
      });
    }

    const updatedSubCategory = await SubCategory.findByPk(id, {
      include: {
        model: Category,
        as: 'category',
        attributes: ['id', 'name']
      }
    });
    res.status(200).json({
      status: "ok",
      data: updatedSubCategory,
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
};

const deleteData = async (req, res) => {
  try {
    const id = req.query.id;

    if (!id) {
      return res.status(400).json({
        status: "fail",
        message: "Subcategory ID is required",
      });
    }

    const deleted = await SubCategory.destroy({ where: { id } });

    if (deleted === 0) {
      return res.status(404).json({
        status: "fail",
        message: "Subcategory not found",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Subcategory deleted successfully",
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
  getAllData,
  createData,
  getDataById,
  updateData,
  deleteData,
};