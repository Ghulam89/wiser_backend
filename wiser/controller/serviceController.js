const db = require("../models/index.js");
const Service = db.service;
const Category = db.category;
const SubCategory = db.subCategory;
const { Op } = require("sequelize");
const getAllData = async (req, res) => {
    try {
        const search = req.query.search || "";
        const categoryId = req.query.categoryId || null;
        const subCategoryId = req.query.subCategoryId || null;
        const page = parseInt(req.query.page) || 1;
        const limit = 20;

        const whereCondition = {
            [Op.or]: [
                { serviceName: { [Op.like]: `%${search}%` }}
            ]
        };

        if (categoryId) whereCondition.categoryId = categoryId;
        if (subCategoryId) whereCondition.subCategoryId = subCategoryId;

        const data = await Service.findAll({
            where: whereCondition,
            include: [
                {
                    model: Category,
                    as: 'category',
                    attributes: ['id', 'name']
                },
                {
                    model: SubCategory,
                    as: 'subCategory',
                    attributes: ['id', 'name']
                }
            ],
            limit: limit,
            offset: (page - 1) * limit,
        });

        const count = await Service.count({
            where: whereCondition,
        });

        res.status(200).json({
             status: "success",
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
        
        const { serviceName, categoryId, subCategoryId, servicePoints, price } = req.body;

        if (!serviceName || !categoryId || !subCategoryId) {
            return res.status(400).json({
                status: "fail",
                message: "Service name, category ID, and subcategory ID are required",
            });
        }

        const category = await Category.findByPk(categoryId);
        if (!category) {
            return res.status(400).json({
                status: "fail",
                message: "Invalid category ID",
            });
        }
        const subCategory = await SubCategory.findOne({
            where: { id: subCategoryId, categoryId: categoryId }
        });
        if (!subCategory) {
            return res.status(400).json({
                status: "fail",
                message: "Invalid subcategory ID or subcategory doesn't belong to this category",
            });
        }

        const existingService = await Service.findOne({
            where: { serviceName },
        });

        if (existingService) {
            return res.status(400).json({
                status: "fail",
                message: "Service already exists",
            });
        }

        let logoPath = null;
        if (req.files && req.files.logo) {
            logoPath = `images/${req.files.logo[0].filename}`;
        }

        let parsedServicePoints = servicePoints;
        if (typeof servicePoints === 'string') {
            try {
                parsedServicePoints = JSON.parse(servicePoints);
            } catch (e) {
                return res.status(400).json({
                    status: "fail",
                    message: "Invalid servicePoints format",
                });
            }
        }

        const service = await Service.create({
            serviceName,
            categoryId,
            subCategoryId,
            logo: logoPath,
            servicePoints: parsedServicePoints,
            price
        });

        res.status(201).json({
            status: "success",
            message: "Service created successfully",
            data: service,
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
                message: "Service ID is required",
            });
        }

        let data = await Service.findByPk(id, {
            include: [
                {
                    model: Category,
                    as: 'category',
                    attributes: ['id', 'name']
                },
                {
                    model: SubCategory,
                    as: 'subCategory',
                    attributes: ['id', 'name']
                }
            ]
        });
        
        if (!data) {
            return res.status(404).json({
                status: "fail",
                message: "Service not found",
            });
        }

        res.status(200).json({
             status: "success",
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
                message: "Service ID is required",
            });
        }

        const service = await Service.findByPk(id);
        if (!service) {
            return res.status(404).json({
                message: "Service not found",
                status: "fail",
            });
        }

        const updateFields = {
            ...req.body
        };

        // Handle logo update
        if (req.files && req.files.logo) {
            updateFields.logo = `images/${req.files.logo[0].filename}`;
        }

        // If categoryId is being updated, check if it exists
        if (req.body.categoryId && req.body.categoryId !== service.categoryId) {
            const category = await Category.findByPk(req.body.categoryId);
            if (!category) {
                return res.status(400).json({
                    status: "fail",
                    message: "Invalid category ID",
                });
            }
            updateFields.categoryId = req.body.categoryId;
        }

        // If subCategoryId is being updated, check if it exists and belongs to category
        if (req.body.subCategoryId && req.body.subCategoryId !== service.subCategoryId) {
            const categoryId = updateFields.categoryId || service.categoryId;
            const subCategory = await SubCategory.findOne({
                where: { id: req.body.subCategoryId, categoryId }
            });
            if (!subCategory) {
                return res.status(400).json({
                    status: "fail",
                    message: "Invalid subcategory ID or subcategory doesn't belong to this category",
                });
            }
            updateFields.subCategoryId = req.body.subCategoryId;
        }

        // If serviceName is being updated, check if it already exists
        if (req.body.serviceName && req.body.serviceName !== service.serviceName) {
            const existingService = await Service.findOne({
                where: { serviceName: req.body.serviceName },
            });

            if (existingService) {
                return res.status(400).json({
                    status: "fail",
                    message: "Service name already exists",
                });
            }
        }

        // Parse servicePoints if it's a string
        if (req.body.servicePoints && typeof req.body.servicePoints === 'string') {
            try {
                updateFields.servicePoints = JSON.parse(req.body.servicePoints);
            } catch (e) {
                return res.status(400).json({
                    status: "fail",
                    message: "Invalid servicePoints format",
                });
            }
        }

        const [updated] = await Service.update(updateFields, {
            where: { id: id },
        });

        if (updated === 0) {
            return res.status(400).json({
                status: "fail",
                message: "No changes were made",
            });
        }

        const updatedService = await Service.findByPk(id, {
            include: [
                {
                    model: Category,
                    as: 'category',
                    attributes: ['id', 'name']
                },
                {
                    model: SubCategory,
                    as: 'subCategory',
                    attributes: ['id', 'name']
                }
            ]
        });
        res.status(200).json({
             status: "success",
            data: updatedService,
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
                message: "Service ID is required",
            });
        }

        const deleted = await Service.destroy({ where: { id } });

        if (deleted === 0) {
            return res.status(404).json({
                status: "fail",
                message: "Service not found",
            });
        }

        return res.status(200).json({
            status: "success",
            message: "Service deleted successfully",
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