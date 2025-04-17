const { getAllData, createData, getDataById, updateData, deleteData, loginData } = require('../controller/userController')

const router = require('express').Router()

router.get('/get', getAllData)
router.post('/login', loginData)
router.post('/create', createData)
router.get('/get/:id', getDataById)
router.put('/update/:id', updateData)
router.delete('/delete/:id', deleteData)
module.exports = router

