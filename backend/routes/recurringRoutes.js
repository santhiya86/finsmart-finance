const express = require('express');
const router = express.Router();
const { getRecurring, addRecurring, toggleRecurring, deleteRecurring, processRecurring } = require('../controllers/recurringController');
const { protect } = require('../middleware/authMiddleware');
router.use(protect);
router.post('/process', processRecurring);
router.route('/').get(getRecurring).post(addRecurring);
router.route('/:id').put(toggleRecurring).delete(deleteRecurring);
module.exports = router;
