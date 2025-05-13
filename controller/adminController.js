const db = require("../models/index.js");
const { Op } = require("sequelize");
const { JWT_SECRET, url } = require("../config/config.js");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
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

    const lowerCaseEmail = req.body.email?.toLowerCase();

    console.log(req.body.email);

    if (!req.body.email) {
      return res.status(400).json({
        status: "fail",
        message: "Email is required",
      });
    }

    if (!req.body.password) {
      return res.status(400).json({
        status: "fail",
        message: "Password is required",
      });
    }

    const passwordRegex =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;

    if (!passwordRegex.test(req.body.password)) {
      return res.status(400).json({
        status: "fail",
        message:
          "Use 8 or more characters with a mix of letters, numbers & symbols.",
      });
    }

    const email = await Admin.findOne({
      where: { email: lowerCaseEmail },
    });

    if (email) {
      return res.status(400).json({
        message: "Email already exists",
        status: "fail",
      });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);

    let data = await Admin.create({
      ...req.body,
      password: hashedPassword,
      email: lowerCaseEmail,
    });

    const token = jwt.sign({ id: data?.id }, JWT_SECRET, { expiresIn: "48h" });

    res.status(200).json({
      status: "success",
      message: "Admin created successfully",
      token,
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
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

    const data = await Admin.findAll({
      where: {
        [Op.or]: [{ email: { [Op.like]: `%${search}%` } }],
      },
      limit: limit,
      offset: (page - 1) * limit,
    });

    const count = await Admin.count({
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
    let id = req.admin.id;

    let data = await Admin.findOne({
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
    const admin = await Admin.findOne({ where: { email: lowerCaseEmail } });

    if (!admin) {
      return res.status(401).json({
        status: "fail",
        message: "Admin not found",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        status: "fail",
        message: "Invalid email or password",
      });
    }

    // Update last login
    await Admin.update({ lastLogin: new Date() }, { where: { id: admin.id } });

    const token = jwt.sign({ id: admin.id }, JWT_SECRET, {
      expiresIn: "48h",
    });

    return res.status(200).json({
      status: "success",
      message: "Login successful",
      data: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        lastLogin: new Date(), // return current login time
      },
      token,
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

    const hashedPassword = await bcrypt.hash(password, 10);

    await admin.update({
      password: hashedPassword,
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
    let id = req.admin.id;
    const idData = await Admin.findOne({
      where: { id: id },
    });
    if (!idData) {
      return res.status(404).json({
        message: "Admin not found",
        status: "fail",
      });
    }

    var lowerCaseEmail = null;
    if (req.body.email) {
      lowerCaseEmail = req.body.email.toLowerCase();

      const email = await Admin.findOne({
        where: { email: lowerCaseEmail },
        attributes: ["id"],
      });

      if (email && email.id !== id) {
        return res.status(400).json({
          message: "Email already exists",
          status: "fail",
        });
      }
    }

    const updateFields = {
      ...req.body,
      email: lowerCaseEmail ? lowerCaseEmail : idData.email,
      password: req.body.password ? req.body.password : idData.password,
    };

    const data = await Admin.update(updateFields, {
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
    const id = req.admin.id;

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
};
