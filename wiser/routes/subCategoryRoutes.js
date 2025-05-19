const { getAllData, createData, getDataById, updateData, deleteData } = require('../controller/subCategoryController');
const router = require('express').Router()
router.get('/getAll', getAllData)
router.post('/create',createData)
router.get('/get',getDataById)
router.put('/update',updateData)
router.delete('/delete', deleteData)
module.exports = router

