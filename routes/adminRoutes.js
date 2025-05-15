const { getAllData, loginData, createData, verifyOTP, resendOTP, sendOTP, resetPassword, getDataById, updateData, deleteData, getAuditLogs, updatePermissions } = require('../controller/adminController')
const { authenticate, auditMiddleware} = require('../middlewares/auth')
const { uploadUserImages } = require('../upload/UploadFile')

const router = require('express').Router()

router.get('/getAll', getAllData)
router.post('/login', loginData)
router.post('/create', createData)
router.post('/otp-verify', verifyOTP)
router.post('/resend-otp', resendOTP)
router.post('/send-otp', sendOTP)
router.post('/resetPassword', resetPassword)
router.get('/get',authenticate, getDataById)
router.put('/update',authenticate,uploadUserImages,updateData)
router.delete('/delete',authenticate, deleteData)
router.delete('/update-permission', updatePermissions)
router.post('/roles', 
  getAuditLogs
);
module.exports = router

