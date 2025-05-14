const { getAllData, createData, getDataById, updateData, deleteData } = require('../controller/subCategoryController');
const authenticate = require('../middlewares/auth')
const router = require('express').Router()
router.get('/getAll', getAllData)
router.post('/create',createData)
router.get('/get',getDataById)
router.put('/update',updateData)
router.delete('/delete',authenticate, deleteData)
module.exports = router

