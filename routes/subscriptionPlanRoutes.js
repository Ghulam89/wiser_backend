const { getAllPlans, createPlan, getPlanById, updatePlan, deletePlan } = require('../controller/subcriptionPlanController');

const router = require('express').Router()

router.get('/getAll', getAllPlans)
router.post('/create',createPlan)
router.get('/get',getPlanById)
router.put('/update',updatePlan)
router.delete('/delete',deletePlan)
module.exports = router

