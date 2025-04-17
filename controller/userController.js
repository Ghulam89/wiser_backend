const db = require('../models/index.js');
const { Op } = require('sequelize');
const { JWT_SECRET } = require('../config/config.js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
// create main model
const User = db.user;

// 1.create product
const createData = async (req, res) => {
    try {
        const lowerCaseEmail = req.body.email?.toLowerCase();

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

        const phone = await User.findOne({
            where: { phone: req.body.phone }
        });

        if (phone && req.body.phone) {
            return res.status(400).json({
                message: "Phone already exists",
                status: 'fail',
            });
        }

        // Hash the password with bcrypt
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);

        let data = await User.create({ 
            ...req.body, 
            password: hashedPassword, 
            email: lowerCaseEmail 
        });

        const token = jwt.sign({ id: data?.id }, JWT_SECRET, { expiresIn: '48h' });

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
        let email = req.body.email

        let emailData = await User.findOne({
            where: { email: email }
        })

        if(emailData){

            const token = jwt.sign({ id: emailData?.id }, JWT_SECRET , { expiresIn: '48h' });

            if(req.body.password===emailData.password){
                return res.status(200).json({
                    status: 'ok',
                    message:'Login successfully!',
                    data: emailData,
                    token
                })
            }else{
                return res.status(400).json({
                    status: 'fail',
                    message: 'Invalid password'
                })
    
        }
        }else{
            return res.status(400).json({
                status: 'fail',
                message: 'Invalid email'
            })
        }

    } catch (err) {
        res.status(500).json({
            error: err.message
        })
    }

}









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

