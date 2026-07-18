const express = require('express');
const router = express.Router();
const { sendMonthlySummary } = require('../controllers/emailController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.post('/monthly-summary', sendMonthlySummary);

module.exports = router;
