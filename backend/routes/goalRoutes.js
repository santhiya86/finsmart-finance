const express = require('express');
const router = express.Router();
const { getGoals, createGoal, addSavings, deleteGoal } = require('../controllers/goalController');
const { protect } = require('../middleware/authMiddleware');
router.use(protect);
router.route('/').get(getGoals).post(createGoal);
router.put('/:id/save', addSavings);
router.delete('/:id', deleteGoal);
module.exports = router;
