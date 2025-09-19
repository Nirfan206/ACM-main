const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const { getAnalytics } = require('../controllers/analyticsController');

// ---------------------------
// Analytics Routes (Admin only)
// ---------------------------

// GET /api/analytics
router.get('/', auth(['admin']), getAnalytics);

module.exports = router;
