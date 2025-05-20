const { getAllTickets, createTicket, getTicketById, updateTicket, deleteTicket } = require('../controller/ticketSupportController');
const {authenticate} = require('../middlewares/auth');
const { uploadServiceImages } = require('../upload/UploadFile');
const router = require('express').Router()
router.get('/getAll', getAllTickets)
router.post('/create',uploadServiceImages,createTicket)
router.get('/get',getTicketById)
router.put('/update',uploadServiceImages,updateTicket)
router.delete('/delete',authenticate, deleteTicket)
module.exports = router

