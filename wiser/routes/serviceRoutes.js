const { getAllData, createData, getDataById, updateData, deleteData } = require('../controller/serviceController');
const {authenticate} = require('../middlewares/auth');
const { uploadServiceImages } = require('../upload/UploadFile');
const router = require('express').Router()
router.get('/getAll', getAllData)
router.post('/create',uploadServiceImages,createData)
router.get('/get',getDataById)
router.put('/update',uploadServiceImages,updateData)
router.delete('/delete',authenticate, deleteData)
module.exports = router

