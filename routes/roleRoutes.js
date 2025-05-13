const { getAllData, createData,getDataById, updateData, deleteData } = require('../controller/roleController')
const authenticate = require('../middlewares/auth')
const { uploadUserImages } = require('../upload/UploadFile')

const router = require('express').Router()

router.get('/getAll', getAllData)
router.post('/create', createData)
router.get('/get',authenticate, getDataById)
router.put('/update',authenticate,uploadUserImages,updateData)
router.delete('/delete',authenticate, deleteData)
module.exports = router

