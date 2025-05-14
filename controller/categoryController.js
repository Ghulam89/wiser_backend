const db = require("../models/index.js");
const Category = db.category;
const { Op } = require("sequelize");

const getAllData = async (req, res) => {
  try {
    const search = req.query.search || "";
    const page = parseInt(req.query.page) || 1;
    const limit = 20;

    const data = await Category.findAll({
      where: {
        [Op.or]: [
          { name: { [Op.like]: `%${search}%` } },
          { description: { [Op.like]: `%${search}%` } }
        ],
      },
      limit: limit,
      offset: (page - 1) * limit,
    });

    const count = await Category.count({
      where: {
        [Op.or]: [
          { name: { [Op.like]: `%${search}%` } },
          { description: { [Op.like]: `%${search}%` } }
        ],
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

const createData = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        status: "fail",
        message: "Name is required",
      });
    }

    const existingCategory = await Category.findOne({
      where: { name },
    });

    if (existingCategory) {
      return res.status(400).json({
        status: "fail",
        message: "Category already exists",
      });
    }

    let imagePath = null;
    if (req.files && req.files.image) {
      imagePath = `images/${req.files.image[0].filename}`;
    }

    // Create category
    const category = await Category.create({
      name,
      description,
      image: imagePath
    });

    res.status(201).json({
      status: "success",
      message: "Category created successfully",
      data: category,
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
        message: "Category ID is required",
      });
    }

    let data = await Category.findByPk(id);
    
    if (!data) {
      return res.status(404).json({
        status: "fail",
        message: "Category not found",
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
        message: "Category ID is required",
      });
    }

    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({
        message: "Category not found",
        status: "fail",
      });
    }

    const updateFields = {
      ...req.body
    };

    if (req.files && req.files.image) {
      updateFields.image = `images/${req.files.image[0].filename}`;
    }

    // If name is being updated, check if it already exists
    if (req.body.name && req.body.name !== category.name) {
      const existingCategory = await Category.findOne({
        where: { name: req.body.name },
      });

      if (existingCategory) {
        return res.status(400).json({
          status: "fail",
          message: "Category name already exists",
        });
      }
    }

    const [updated] = await Category.update(updateFields, {
      where: { id: id },
    });

    if (updated === 0) {
      return res.status(400).json({
        status: "fail",
        message: "No changes were made",
      });
    }

    const updatedCategory = await Category.findByPk(id);
    res.status(200).json({
      status: "ok",
      data: updatedCategory,
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
        message: "Category ID is required",
      });
    }

    const deleted = await Category.destroy({ where: { id } });

    if (deleted === 0) {
      return res.status(404).json({
        status: "fail",
        message: "Category not found",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Category deleted successfully",
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