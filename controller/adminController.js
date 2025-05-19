const db = require("../models/index.js");
const { Op } = require("sequelize");
const { JWT_SECRET, url } = require("../config/config.js");
const jwt = require("jsonwebtoken");
// const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
// create main model
const Admin = db.admin;

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    admin: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

const generateOTP = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

const setDefaultPermissions = (role) => {
  const permissions = {
    'Super Admin': {
      selectAll: true,
      userManagement: { view: true, edit: true, delete: true },
      servicesPackages: { view: true, edit: true, delete: true },
      rolesPermissions: { view: true, edit: true, delete: true },
      documents: { view: true, edit: true, delete: true },
      tickets: { view: true, edit: true, delete: true }
    },
    'Operations Admin': {
      selectAll: false,
      userManagement: { view: false, edit: false, delete: false },
      servicesPackages: { view: false, edit: false, delete: false },
      rolesPermissions: { view: true, edit: true, delete: true },
      documents: { view: false, edit: false, delete: false },
      tickets: { view: false, edit: false, delete: false }
    },
    'Admin Staff': {
      selectAll: false,
      userManagement: { view: false, edit: false, delete: false },
      servicesPackages: { view: false, edit: false, delete: false },
      rolesPermissions: { view: false, edit: false, delete: false },
      documents: { view: false, edit: false, delete: false },
      tickets: { view: false, edit: false, delete: false }
    },
    'Tech Admin': {
      selectAll: false,
      userManagement: { view: false, edit: false, delete: false },
      servicesPackages: { view: false, edit: false, delete: false },
      rolesPermissions: { view: false, edit: false, delete: false },
      documents: { view: false, edit: false, delete: false },
      tickets: { view: false, edit: false, delete: false }
    }
  };

  return permissions[role] || permissions['Super Admin'];
};


const createData = async (req, res) => {
  try {
    // const { captchaToken } = req.body;

    // if (!captchaToken) {
    //   return res.status(400).json({
    //     status: "fail",
    //     message: "CAPTCHA token is required",
    //   });
    // }
    // const captchaSecret = process.env.RECAPTCHA_SECRET_KEY;
    // const captchaVerificationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${captchaSecret}&response=${captchaToken}`;

    // const captchaResponse = await axios.post(captchaVerificationUrl);
    // const captchaData = captchaResponse.data;

    // if (!captchaData.success || captchaData.score < 0.5) {
    //   return res.status(400).json({
    //     status: "fail",
    //     message: "CAPTCHA verification failed",
    //   });
    // }

 const { name, email, password,role,description} = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        status: "fail",
        message: "Name, email, password, and  are required",
      });
    }

    const lowerCaseEmail = email.toLowerCase();

    // Check if email already exists
    const existingAdmin = await Admin.findOne({
      where: { email: lowerCaseEmail },
    });

    if (existingAdmin) {
      return res.status(400).json({
        status: "fail",
        message: "Email already exists",
      });
    }

    // Hash password
    // const saltRounds = 10;
    // const hashedPassword = await bcrypt.hash(password, saltRounds);

        const adminRole = role || 'Super Admin';
    const permissions = setDefaultPermissions(adminRole);

    // Create admin
    const admin = await Admin.create({
     name,
      email: lowerCaseEmail,
      password: password,
      role: adminRole,
      description:description,
      permissions
    });

    // Generate JWT token
    const token = jwt.sign({ id: admin.id }, JWT_SECRET, { expiresIn: "48h" });

    res.status(201).json({
      status: "success",
      message: "Admin created successfully",
      token,
      
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};

const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        status: "fail",
        message: "Email is required",
      });
    }

    const lowerCaseEmail = email.toLowerCase();

    const admin = await Admin.findOne({
      where: { email: lowerCaseEmail },
    });

    if (!admin) {
      return res.status(404).json({
        status: "fail",
        message: "Admin not found",
      });
    }

    const otp = generateOTP();
    admin.otp = otp;
    admin.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await Admin.save();

    const emailTemplateWithOTP = `
      <div style="background-color:#F9B134;padding:30px;display:flex;justify-content:center;align-items:center;">
        <div style="background-color:white;border-radius:10px;padding:30px;width:100%">
          <h3 style="text-align:center;">Wiser</h3>
          <div style="width: 100%;text-align:center">
            <img src="https://cdn-icons-png.flaticon.com/512/10646/10646637.png" width="60px" height="60px" style="object-fit: contain;">
          </div>
          <h3 style="text-align:center;">Here is your One Time Password</h3>
          <p style="text-align:center;">to validate your email address</p>
          <div style="margin:30px 0px;">
            <h3 style="text-align:center;letter-spacing:18px;font-size:30px;">${otp}</h3>
          </div>
          <p style="line-height:1.6;margin-bottom:20px;text-align:center;">Thank you for your requesting.</p>
        </div>
      </div>
    `;

    const mailOptions = {
      from: process.env.EMAIL,
      to: admin.email,
      subject: "Your Verification Code",
      html: emailTemplateWithOTP,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        return res.status(500).json({
          status: "error",
          message: "Failed to send OTP email",
        });
      }

      res.status(200).json({
        status: "success",
        message: "OTP sent successfully",
      });
    });
  } catch (err) {
    console.error("Error in sendOTP:", err);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
      error: err.message,
    });
  }
};

const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    console.log("Received OTP verification request:", { email, otp });

    if (!email || !otp) {
      return res.status(400).json({
        status: "fail",
        message: "Email and OTP are required",
      });
    }

    const lowerCaseEmail = email.toLowerCase();
    const admin = await Admin.findOne({
      where: { email: lowerCaseEmail },
    });

    if (!admin) {
      console.log("Admin not found for email:", lowerCaseEmail);
      return res.status(404).json({
        status: "fail",
        message: "Admin not found",
      });
    }

    console.log("Admin found:", {
      storedOTP: admin.otp,
      inputOTP: otp,
      otpExpires: admin.otpExpires,
      currentTime: new Date(),
    });

    if (admin.otp !== otp) {
      console.log("OTP mismatch");
      return res.status(400).json({
        status: "fail",
        message: "Invalid OTP",
      });
    }

    if (admin.otpExpires < new Date()) {
      console.log("OTP expired");
      return res.status(400).json({
        status: "fail",
        message: "OTP has expired",
      });
    }

    admin.isVerified = true;
    admin.otp = null;
    admin.otpExpires = null;
    await admin.save();

    console.log("OTP verified successfully for admin:", admin.id);
    res.status(200).json({
      status: "success",
      message: "OTP verified successfully",
    });
  } catch (err) {
    console.error("Error in verifyOTP:", err);
    res.status(500).json({
      error: err.message,
    });
  }
};

const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        status: "fail",
        message: "Email is required",
      });
    }

    const lowerCaseEmail = email.toLowerCase();
    const admin = await Admin.findOne({
      where: { email: lowerCaseEmail },
    });

    if (!admin) {
      return res.status(404).json({
        status: "fail",
        message: "Admin not found",
      });
    }

    const otp = generateOTP();
    admin.otp = otp;
    admin.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await admin.save();

    const emailTemplateWithOTP = `
            <div>
                <h2>Your New Verification Code</h2>
                <p>Your new verification code is: <strong>${otp}</strong></p>
                <p>This code will expire in 10 minutes.</p>
            </div>
        `;

    const mailOptions = {
      from: "gm6681328@gmail.com",
      to: admin.email,
      subject: "Your New Verification Code",
      html: emailTemplateWithOTP,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        return res.status(500).json({
          status: "fail",
          message: "Failed to send OTP email",
        });
      }
      res.status(200).json({
        status: "success",
        message: "New OTP sent successfully",
      });
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

    // if (req.admin.role !== 'Super Admin' && 
    //     (!req.admin.permissions || !req.admin.permissions.userManagement || !req.admin.permissions.userManagement.view)) {
    //   return res.status(403).json({
    //     status: "fail",
    //     message: "You don't have permission to view admin data"
    //   });
    // }

    const data = await Admin.findAll({
      where: {
        [Op.or]: [
          { email: { [Op.like]: `%${search}%` } },
          { name: { [Op.like]: `%${search}%` } }
        ],
      },
      attributes: ['id', 'name', 'email', 'role', 'permissions', 'lastLogin'],
      limit: limit,
      offset: (page - 1) * limit,
    });

    const count = await Admin.count({
      where: {
        [Op.or]: [
          { email: { [Op.like]: `%${search}%` } },
          { name: { [Op.like]: `%${search}%` } }
        ],
      },
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

const getDataById = async (req, res) => {
  try {
    let id = req.query.id;

    let data = await Admin.findOne({
      where: { id: id },
      attributes: ['id', 'name', 'email', 'role','description', 'permissions', 'lastLogin']
    });

    if (!data) {
      return res.status(404).json({
        status: "fail",
        message: "Admin not found"
      });
    }

   
    res.status(200).json({
       status: "success",
      data:data,
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
};

const loginData = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: "fail",
        message: "Email and password are required",
      });
    }

    const lowerCaseEmail = email.toLowerCase();
    const admin = await Admin.findOne({ 
      where: { email: lowerCaseEmail },
      attributes: { exclude: ['otp', 'otpExpires'] }
    });

    if (!admin) {
      return res.status(401).json({
        status: "fail",
        message: "Admin not found",
      });
    }

    // const isPasswordValid = await bcrypt.compare(password, admin.password);

    if (admin.password!==password) {
      return res.status(401).json({
        status: "fail",
        message: "Invalid email or password",
      });
    }

    await Admin.update({ lastLogin: new Date() }, { where: { id: admin.id } });

    const token = jwt.sign({ id: admin.id }, JWT_SECRET, {
      expiresIn: "48h",
    });

    const adminData = {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      permissions: admin.permissions,
      lastLogin: new Date()
    };

    return res.status(200).json({
      status: "success",
      message: "Login successful",
      token,
      data: adminData
    });
  } catch (err) {
    console.error("Admin login error:", err);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, otp, password } = req.body;

    if (!email || !otp || !password) {
      return res.status(400).json({
        status: "fail",
        message: "Email, OTP, and new password are required",
      });
    }

    const lowerCaseEmail = email.toLowerCase();

    const admin = await Admin.findOne({
      where: { email: lowerCaseEmail },
    });

    if (!admin) {
      return res.status(404).json({
        status: "fail",
        message: "Admin not found",
      });
    }

    if (admin.otp !== otp || admin.otpExpires < new Date()) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid or expired OTP",
      });
    }

    const passwordRegex =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        status: "fail",
        message:
          "Password must be at least 8 characters long and contain at least 1 letter, 1 number, and 1 special character",
      });
    }

    // const hashedPassword = await bcrypt.hash(password, 10);

    await admin.update({
      password: password,
      otp: null,
      otpExpires: null,
    });

    return res.status(200).json({
      status: "success",
      message: "Password reset successfully",
    });
  } catch (err) {
    console.error("Error in resetPassword:", err);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
      error: err.message,
    });
  }
};

const updateData = async (req, res) => {
  try {
    const id = req.query.id
    const {permissions,role} = req.body;

    if (role !== 'Super Admin' && 
        (!permissions)) {
      return res.status(403).json({
        status: "fail",
        message: "You don't have permission to update admin data"
      });
    }

    const adminToUpdate = await Admin.findOne({
      where: { id: id },
    });

    if (!adminToUpdate) {
      return res.status(404).json({
        message: "Admin not found",
        status: "fail",
      });
    }

    if (role === !'Super Admin') {
      return res.status(403).json({
        status: "fail",
        message: "Cannot modify Super Admin account"
      });
    }

    let lowerCaseEmail = null;
    if (req.body.email) {
      lowerCaseEmail = req.body.email.toLowerCase();

      const existingEmail = await Admin.findOne({
        where: { email: lowerCaseEmail },
        attributes: ["id"],
      });

      if (existingEmail && existingEmail.id !== id) {
        return res.status(400).json({
          message: "Email already exists",
          status: "fail",
        });
      }
    }

    const updateFields = {
      ...req.body,
      email: lowerCaseEmail ? lowerCaseEmail : adminToUpdate.email,
      password:req.body.password
    };

    // if (req.body.password) {
    //   const saltRounds = 10;
    //  await updateFields.password
    //   updateFields.password = await bcrypt.hash(req.body.password, saltRounds);
    // }

    if (role && role !== 'Super Admin') {
      return res.status(403).json({
        status: "fail",
        message: "Only Super Admin can change roles"
      });
    }
    if (role) {
      permissions = setDefaultPermissions(role);
    }

    await Admin.update(updateFields, {
      where: { id: id },
    });

    const updatedAdmin = await Admin.findOne({
      where: { id: id },
      attributes: ['id', 'name', 'email', 'role', 'permissions', 'lastLogin']
    });

    

    res.status(200).json({
      status: "success",
      message: "Admin updated successfully",
      data: updatedAdmin,
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
};

const deleteData = async (req, res) => {
  try {
    const id = req.params.id;
    const requestingAdmin = req.admin;
    if (requestingAdmin.role !== 'Super Admin' && 
        (!requestingAdmin.permissions || !requestingAdmin.permissions.userManagement || !requestingAdmin.permissions.userManagement.delete)) {
      return res.status(403).json({
        status: "fail",
        message: "You don't have permission to delete admins"
      });
    }

    const adminToDelete = await Admin.findOne({
      where: { id: id },
    });

    if (!adminToDelete) {
      return res.status(404).json({
        status: "fail",
        message: "Admin not found",
      });
    }

    // Prevent deletion of Super Admin
    if (adminToDelete.role === 'Super Admin') {
      return res.status(403).json({
        status: "fail",
        message: "Cannot delete Super Admin account"
      });
    }

    // Prevent self-deletion
    if (requestingAdmin.id === adminToDelete.id) {
      return res.status(403).json({
        status: "fail",
        message: "Cannot delete your own account"
      });
    }

    const deleted = await Admin.destroy({ where: { id } });

    if (deleted === 0) {
      return res.status(404).json({
        status: "fail",
        message: "Admin not found",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Admin deleted successfully",
    });
  } catch (err) {
    console.error("Delete error:", err);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

// Add this new function to update permissions
const updatePermissions = async (req, res) => {
  try {
    const { id, permissions,role } = req.body;
   
    if (role !== 'Super Admin') {
      return res.status(403).json({
        status: "fail",
        message: "Only Super Admin can update permissions"
      });
    }

    const adminToUpdate = await Admin.findOne({ where: { id } });
    if (!adminToUpdate) {
      return res.status(404).json({
        status: "fail",
        message: "Admin not found"
      });
    }

    if (role === !'Super Admin') {
      return res.status(403).json({
        status: "fail",
        message: "Cannot modify Super Admin permissions"
      });
    }

    await adminToUpdate.update({ permissions });
    const updatedAdmin = await Admin.findOne({
      where: { id },
      attributes: ['id', 'name', 'email', 'role', 'permissions']
    });

    res.status(200).json({
      status: "success",
      message: "Permissions updated successfully",
      data:updatedAdmin
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message
    });
  }
};

const getAuditLogs = async (req, res) => {
  try {
    
    if (req.role !== 'Super Admin') {
      return res.status(403).json({
        status: "fail",
        message: "Only Super Admin can view audit logs"
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const offset = (page - 1) * limit;

    const { count, rows } = await db.auditLog.findAndCountAll({
      include: [{
        model: db.admin,
        attributes: ['id', 'name', 'email', 'role']
      }],
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });

    res.status(200).json({
      status: "success",
      data: rows,
      pagination: {
        total: count,
        pages: Math.ceil(count / limit),
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


module.exports = {
  createData,
  getAllData,
  getDataById,
  updateData,
  deleteData,
  verifyOTP,
  loginData,
  resendOTP,
  resetPassword,
  sendOTP,
  updatePermissions,
  getAuditLogs
};
