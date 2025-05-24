// routes/membershipDeadlineRoutes.js
const express = require('express');
const router = express.Router();
const membershipDeadlineController = require('../controller/membershipDeadlineController');
router.get('/getAll', membershipDeadlineController.getAllMemberships);
router.post('/create', membershipDeadlineController.createMembership);
router.get('/get', membershipDeadlineController.getMembershipById);
router.put('/update', membershipDeadlineController.updateMembership);
router.delete('/delete', membershipDeadlineController.deleteMembership);

module.exports = router;