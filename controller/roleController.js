const db = require("../models/index.js");
const { Op } = require("sequelize");
const Role = db.role;


const createData = async (req, res) => {
  try {
    const { name, description, permissions } = req.body;

    if (!name) {
      return res.status(400).json({
        status: "fail",
        message: "Role name is required",
      });
    }

    // Create the role
    const role = await Role.create({
      name,
      description,
    });

    // Create permissions for the role
    if (permissions && permissions.length) {
      const rolePermissions = permissions.map(perm => ({
        ...perm,
        roleId: role.id
      }));
      await db.permission.bulkCreate(rolePermissions);
    }

    // Fetch the role with permissions to return
    const roleWithPermissions = await Role.findByPk(role.id, {
      include: {
        model: db.permission,
        as: 'permissions'
      }
    });

    res.status(201).json({
      status: "success",
      message: "Role created successfully",
      data: roleWithPermissions,
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};



// Get all roles with permissions
const getAllData = async (req, res) => {
  try {
    const roles = await Role.findAll({
      include: {
        model: db.permission,
        as: 'permissions'
      }
    });

    res.status(200).json({
      status: "success",
      data: roles,
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


// Update a role and its permissions
const updateData = async (req, res) => {
  try {
    const { name, description, permissions } = req.body;

    const role = await Role.findByPk(req.params.id);
    if (!role) {
      return res.status(404).json({
        status: "fail",
        message: "Role not found",
      });
    }

    // Update role details
    await role.update({
      name: name || role.name,
      description: description || role.description,
    });

    // Update permissions
    if (permissions && permissions.length) {
      // First delete existing permissions
      await db.permission.destroy({
        where: { roleId: role.id }
      });

      // Then create new ones
      const rolePermissions = permissions.map(perm => ({
        ...perm,
        roleId: role.id
      }));
      await db.permission.bulkCreate(rolePermissions);
    }

    // Fetch the updated role with permissions
    const updatedRole = await Role.findByPk(role.id, {
      include: {
        model: db.permission,
        as: 'permissions'
      }
    });

    res.status(200).json({
      status: "success",
      message: "Role updated successfully",
      data: updatedRole,
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message,
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
