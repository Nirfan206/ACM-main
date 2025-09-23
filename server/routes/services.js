const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const {
  getServices,
  createService,
  updateService,
  deleteService
} = require('../controllers/serviceController');

// ---------------------------
// Service Routes
// ---------------------------

// GET /api/services
// Public route - anyone can view available services to book them.
router.get('/', getServices);

// POST /api/services
// Admin only - create a new service.
router.post('/', auth(['admin']), createService);

// PUT /api/services/:id
// Admin only - update an existing service.
router.put('/:id', auth(['admin']), updateService);

// DELETE /api/services/:id
// Admin only - delete a service.
router.delete('/:id', auth(['admin']), deleteService);

module.exports = router;
