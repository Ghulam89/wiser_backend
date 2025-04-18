const db = require('../models/index.js');
const { Op } = require('sequelize');
const { JWT_SECRET, url } = require('../config/config.js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const  nodemailer = require('nodemailer');
// create main model
const User = db.user;


const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: "gm6681328@gmail.com",
        pass: "ptpatylqsrszlqtq", 
    },
    tls: {
        rejectUnauthorized: false 
    }
});

const generateOTP = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
};

const createData = async (req, res) => {
    try {
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

        const email = await User.findOne({
            where: { email: lowerCaseEmail }
        });

        if (email) {
            return res.status(400).json({
                message: "Email already exists",
                status: 'fail',
            });
        }

        if (req.body.phone) {
            const phone = await User.findOne({
                where: { phone: req.body.phone }
            });

            if (phone) {
                return res.status(400).json({
                    message: "Phone number already exists",
                    status: 'fail',
                });
            }
        }
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
        const otp = generateOTP();
        
        let data = await User.create({ 
            ...req.body, 
            password: hashedPassword, 
            email: lowerCaseEmail,
            otp: otp,
            otpExpires: new Date(Date.now() + 10 * 60 * 1000)
        });

        const token = jwt.sign({ id: data?.id }, JWT_SECRET, { expiresIn: '48h' });

        const emailTemplateWithOTP = `
            <div>
                <h2>Thank You for Your Registration</h2>
                <p>Your account has been successfully created.</p>
                <p>Your verification code is: <strong>${otp}</strong></p>
                <p>This code will expire in 10 minutes.</p>
                <p>If you didn't request this, please ignore this email.</p>
            </div>
        `;

        const mailOptions = {
            from: 'gm6681328@gmail.com',
            to: data?.email,
            subject: 'Your Verification Code',
            html: emailTemplateWithOTP
        };

        // Send email with OTP
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
            } else {
                console.log('Email sent:', info.response);
            }
        });

        res.status(200).json({
            status: 'success',
            data: data,
            token
        });

    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
};



const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;
        console.log('Received OTP verification request:', { email, otp });

        if (!email || !otp) {
            return res.status(400).json({
                status: "fail",
                message: "Email and OTP are required",
            });
        }
        
        const lowerCaseEmail = email.toLowerCase();
        const user = await User.findOne({
            where: { email: lowerCaseEmail }
        });

        if (!user) {
            console.log('User not found for email:', lowerCaseEmail);
            return res.status(404).json({
                status: "fail",
                message: "User not found",
            });
        }

        console.log('User found:', {
            storedOTP: user.otp,
            inputOTP: otp,
            otpExpires: user.otpExpires,
            currentTime: new Date()
        });

        if (user.otp !== otp) {
            console.log('OTP mismatch');
            return res.status(400).json({
                status: "fail",
                message: "Invalid OTP",
            });
        }

        if (user.otpExpires < new Date()) {
            console.log('OTP expired');
            return res.status(400).json({
                status: "fail",
                message: "OTP has expired",
            });
        }
        
        user.isVerified = true;
        user.otp = null;
        user.otpExpires = null;
        await user.save();
        
        console.log('OTP verified successfully for user:', user.id);
        res.status(200).json({
            status: 'success',
            message: 'OTP verified successfully',
        });

    } catch (err) {
        console.error('Error in verifyOTP:', err);
        res.status(500).json({
            error: err.message
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
        const user = await User.findOne({
            where: { email: lowerCaseEmail }
        });

        if (!user) {
            return res.status(404).json({
                status: "fail",
                message: "User not found",
            });
        }

        const otp = generateOTP();
        user.otp = otp;
        user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
        await user.save();

        const emailTemplateWithOTP = `
            <div>
                <h2>Your New Verification Code</h2>
                <p>Your new verification code is: <strong>${otp}</strong></p>
                <p>This code will expire in 10 minutes.</p>
            </div>
        `;

        const mailOptions = {
            from: 'gm6681328@gmail.com',
            to: user.email,
            subject: 'Your New Verification Code',
            html: emailTemplateWithOTP
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
                return res.status(500).json({
                    status: "fail",
                    message: "Failed to send OTP email"
                });
            }
            res.status(200).json({
                status: 'success',
                message: 'New OTP sent successfully',
            });
        });

    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
};

// 2.get all products
const getAllData = async (req, res) => {

    try {


        const search = req.query.search || "";
        const page = parseInt(req.query.page) || 1;
        const limit = 20;

        const data = await User.findAll({
            where: {
                [Op.or]: [
                    { email: { [Op.like]: `%${search}%` } },
                ]
            },
            limit: limit,
            offset: (page - 1) * limit
        });

        const count = await User.count({
            where: {
                [Op.or]: [
                    { email: { [Op.like]: `%${search}%` } },
                ]
            }
        });


        res.status(200).json({
            status: 'ok',
            data: data,
            search,
            page,
            count,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            limit
        })
    } catch (err) {
        res.status(500).json({
            error: err.message
        })
    }

}



// 3.get product by id
const getDataById = async (req, res) => {


    try {
        let id = req.params.id

        let data = await User.findOne({
            where: { id: id }
        })
        res.status(200).json({
            status: 'ok',
            data: data
        })
    } catch (err) {
        res.status(500).json({
            error: err.message
        })
    }

}




// 3.get product by id
const loginData = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email) {
            return res.status(400).json({
                status: 'fail',
                message: 'Email  are required'
            });
        }

        if (!password) {
            return res.status(400).json({
                status: 'fail',
                message: 'Password  are required'
            });
        }
        

        if (!process.env.JWT_SECRET) {
            console.error('JWT_SECRET:', process.env.JWT_SECRET);
            throw new Error('JWT secret is not configured properly in environment variables');
        }

        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(401).json({
                status: 'fail',
                message: 'User not found!'
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        
        if (!isPasswordValid) {
            return res.status(401).json({
                status: 'fail',
                message: 'Wrong password!'
            });
        }

        const token = jwt.sign(
            { id: user.id }, 
            process.env.JWT_SECRET, 
            { expiresIn: '48h' }
        );

        return res.status(200).json({
            status: 'success',
            message: 'Login successful',
            data: user,
            token
        });

    } catch (err) {
        console.error('Login error:', err);
        return res.status(500).json({
            status: 'error',
            message: err.message || 'Internal server error'
        });
    }
};


// 4.update product

const updateData = async (req, res) => {
    try {
        let id = req.params.id;
        const idData = await User.findOne({
            where: { id: id }
        });
        if (!idData) {
            return res.status(404).json({
                message: "User not found",
                status: 'fail',
            });
        }

        var lowerCaseEmail = null;
        if (req.body.email) {
            lowerCaseEmail = req.body.email.toLowerCase();
           
            const email = await User.findOne({
                where: { email: lowerCaseEmail },
                attributes: ['id']
            });
            
            if (email && email.id !== id) {
                return res.status(400).json({
                    message: "Email already exists",
                    status: 'fail',
                });
            }
        }

        if (req.body.userName) {
           
            const userName = await User.findOne({
                where: { userName: req.body.userName },
                attributes: ['id']
            });
            
            if (userName && userName.id !== id) {
                return res.status(400).json({
                    message: "Username already exists",
                    status: 'fail',
                });
            }
        }

        
        if (req.body.phone) {
           
            const phone = await User.findOne({
                where: { phone: req.body.phone },
                attributes: ['id']
            });
            
            if (phone && phone.id !== id) {
                return res.status(400).json({
                    message: "Phone already exists",
                    status: 'fail',
                });
            }
        }

        const updateFields = {
            ...req.body,
            email: lowerCaseEmail ? lowerCaseEmail : idData.email,
            password: req.body.password ? req.body.password : idData.password
        };

        if (req.files) {
            if (req.files.CPRFrontSide) {
                updateFields.CPRFrontSide = `images/${req.files.CPRFrontSide[0].filename}`;
            }
            if (req.files.CPRBackSide) {
                updateFields.CPRBackSide = `images/${req.files.CPRBackSide[0].filename}`;
            }
            if (req.files.CPRReader) {
                updateFields.CPRReader = `images/${req.files.CPRReader[0].filename}`;
            }
            if (req.files.passport) {
                updateFields.passport = `images/${req.files.passport[0].filename}`;
            }
        }

        const data = await User.update(updateFields, {
            where: { id: id }
        });

        res.status(200).json({
            status: 'ok',
            data: data
        });
    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
};

// 5.delete product

const deleteData = async (req, res) => {

    try {
        let id = req.params.id

        const data = await User.destroy({
            where: { id: id }
        })
        res.status(200).json({
            status: 'ok',
            data: data
        })
    } catch (err) {
        res.status(500).json({
            error: err.message
        })
    }

}








module.exports = {
    createData,
    getAllData,
    getDataById,
    updateData,
    deleteData,
    verifyOTP,
    loginData,
    resendOTP
}

