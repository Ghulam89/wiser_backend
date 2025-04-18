const { getAllData, createData, getDataById, updateData, deleteData, loginData, verifyOTP, resendOTP } = require('../controller/userController')
const { uploadUserImages } = require('../upload/UploadFile')

const router = require('express').Router()

router.get('/get', getAllData)
router.post('/login', loginData)
router.post('/create', createData)
router.post('/otp-verify', verifyOTP)
router.post('/resend-otp', resendOTP)
router.get('/get/:id', getDataById)
router.put('/update/:id',uploadUserImages,updateData)
router.delete('/delete/:id', deleteData)
module.exports = router

