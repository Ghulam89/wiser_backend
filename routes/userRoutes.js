const { getAllData, createData, getDataById, updateData, deleteData, loginData, verifyOTP, resendOTP } = require('../controller/userController')
const authenticate = require('../middlewares/auth')
const { uploadUserImages } = require('../upload/UploadFile')

const router = require('express').Router()

router.get('/getAll', getAllData)
router.post('/login', loginData)
router.post('/create', createData)
router.post('/otp-verify', verifyOTP)
router.post('/resend-otp', resendOTP)
router.get('/get',authenticate, getDataById)
router.put('/update',authenticate,uploadUserImages,updateData)
router.delete('/delete',authenticate, deleteData)
module.exports = router

