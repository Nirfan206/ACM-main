const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getSettings,
  updateSettings,
  getAdminProfile,
  updateAdminProfile,
  updateAdminPassword,
  assignEmployeeToBooking,
  getAllEmployeeStatuses,
  getAllBookings, // NEW: Import
  updateBookingStatusByAdmin // NEW: Import
} = require('../controllers/adminController');

// ---------------------------
// Admin User Management Routes
// ---------------------------

// Get all users (admin and customercare)
router.get('/users', auth(['admin', 'customercare']), getUsers);

// Create a new user (admin only)
router.post('/users', auth(['admin']), createUser);

// Update a user by ID (admin only)
router.put('/users/:id', auth(['admin']), updateUser);

// Delete a user by ID (admin only)
router.delete('/users/:id', auth(['admin']), deleteUser);

// ---------------------------
// Admin Profile Routes
// ---------------------------

// GET /api/admin/profile - fetch logged-in admin's profile
router.get('/profile', auth(['admin']), getAdminProfile);

// PUT /api/admin/profile - update admin's profile
router.put('/profile', auth(['admin']), updateAdminProfile);

// PUT /api/admin/password - update admin's password
router.put('/password', auth(['admin']), updateAdminPassword);


// ---------------------------
// Admin Booking Management Routes
// ---------------------------

// GET /api/admin/bookings - Get all bookings
router.get('/bookings', auth(['admin']), getAllBookings);

// PUT /api/admin/bookings/:bookingId/assign-employee
// Assign an employee to a specific booking (Admin can also do this)
router.put('/bookings/:bookingId/assign-employee', auth(['admin']), assignEmployeeToBooking);

// PUT /api/admin/bookings/:bookingId/status
// Update the status of a specific booking by Admin
router.put('/bookings/:bookingId/status', auth(['admin']), updateBookingStatusByAdmin);


// ---------------------------
// Admin Settings Routes
// ---------------------------

// Get site settings (admin only)
router.get('/settings', auth(['admin']), getSettings);

// Update site settings (admin only)
router.put('/settings', auth(['admin']), updateSettings);

// ---------------------------
// Admin Employee Status Monitoring
// ---------------------------

// GET /api/admin/employees/status - Get all employee working statuses
// Now accessible by both 'admin' and 'customercare' roles
router.get('/employees/status', auth(['admin', 'customercare']), getAllEmployeeStatuses);


module.exports = router;