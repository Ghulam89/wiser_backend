const db = require('../models/index.js');
const { Op } = require('sequelize');
const { JWT_SECRET } = require('../config/config.js');
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

        if (!email || !password) {
            return res.status(400).json({
                status: 'fail',
                message: 'Email and password are required'
            });
        }

        if (!process.env.JWT_SECRET) {
            throw new Error('JWT secret is not configured');
        }

        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(401).json({
                status: 'fail',
                message: 'Invalid credentials'
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        
        if (!isPasswordValid) {
            return res.status(401).json({
                status: 'fail',
                message: 'Invalid credentials'
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
            data:user,
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
        let id = req.params.id

        const idData = await User.findOne({
            where: { id: id }
        })





        var lowerCaseEmail = null;

        var hashedPassword = null;



        if (req.body.password) {
            hashedPassword = req.body.password;
        }


        if (req.body.email) {
            lowerCaseEmail = req.body.email.toLowerCase();
        }




        const email = await User.findOne({
            where: { email: lowerCaseEmail }
        })


        if (email && req.body.email) {
            return res.status(400).json({
                message: "Email already exists",
                status: 'fail',
            });
        }


        const userName = await User.findOne({
            where: { userName: req.body.userName }
        })


        if (userName && req.body.userName) {
            return res.status(400).json({
                message: "Username already exists",
                status: 'fail',
            });
        }



        const phone = await User.findOne({
            where: { phone: req.body.phone }
        })


        if (phone && req.body.phone) {
            return res.status(400).json({
                message: "Phone already exists",
                status: 'fail',
            });
        }





        const data = await User.update({ ...req.body, email: lowerCaseEmail ? lowerCaseEmail : idData?.email, password: hashedPassword ? hashedPassword : idData?.password }, {
            where: { id: id }
        }
        )
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
    loginData
}

