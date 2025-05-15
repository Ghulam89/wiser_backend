const { getAllData, createData, getDataById, updateData, deleteData } = require('../controller/categoryController');
const {authenticate} = require('../middlewares/auth')
const {uploadCategoryImages } = require('../upload/UploadFile')

const router = require('express').Router()

router.get('/getAll', getAllData)
router.post('/create',uploadCategoryImages,createData)
router.get('/get',getDataById)
router.put('/update',uploadCategoryImages,updateData)
router.delete('/delete',authenticate, deleteData)
module.exports = router

