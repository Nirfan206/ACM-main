// routes/customercare.js
const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const {
  getBookingRequests,
  getCallbackRequests,
  notifyCustomer,
  escalateIssue,
  assignEmployeeToBooking,      // NEW: Import
  updateBookingStatusByCare,    // NEW: Import
  getCustomers,                 // NEW: Import
  createCustomer,               // NEW: Import
  updateCustomer,               // NEW: Import
  getCustomerCareProfile,       // NEW: Import
  updateCustomerCareProfile,    // NEW: Import
  updateCustomerCarePassword    // NEW: Import
} = require('../controllers/customercareController');

// ---------------------------
// Customer Care Profile Routes (NEW)
// ---------------------------

// GET /api/customercare/profile - fetch logged-in customer care's profile
router.get('/profile', auth(['customercare']), getCustomerCareProfile);

// PUT /api/customercare/profile - update customer care's profile
router.put('/profile', auth(['customercare']), updateCustomerCareProfile);

// PUT /api/customercare/password - update customer care's password
router.put('/password', auth(['customercare']), updateCustomerCarePassword);


// ---------------------------
// Customer Care Booking & Callback Request Routes
// ---------------------------

// GET /api/customercare/requests
// Fetch all customer booking requests (accessible to customer care & admin)
router.get('/requests', auth(['customercare', 'admin']), getBookingRequests);

// GET /api/customercare/callback-requests
// Fetch all customer callback requests (accessible to customer care & admin)
router.get('/callback-requests', auth(['customercare', 'admin']), getCallbackRequests);

// PUT /api/customercare/bookings/:bookingId/assign-employee (NEW)
// Assign an employee to a specific booking
router.put('/bookings/:bookingId/assign-employee', auth(['customercare', 'admin']), assignEmployeeToBooking);

// PUT /api/customercare/bookings/:bookingId/status (NEW)
// Update the status of a specific booking
router.put('/bookings/:bookingId/status', auth(['customercare', 'admin']), updateBookingStatusByCare);


// ---------------------------
// Customer Care Customer Management Routes (NEW)
// ---------------------------

// GET /api/customercare/customers - Get all customer users
router.get('/customers', auth(['customercare', 'admin']), getCustomers);

// POST /api/customercare/customers - Create a new customer user
router.post('/customers', auth(['customercare', 'admin']), createCustomer);

// PUT /api/customercare/customers/:id - Update an existing customer user
router.put('/customers/:id', auth(['customercare', 'admin']), updateCustomer);


// ---------------------------
// Customer Care Notification & Escalation Routes
// ---------------------------

// POST /api/customercare/notify
// Notify a customer about booking updates or callbacks
router.post('/notify', auth(['customercare', 'admin']), notifyCustomer);

// POST /api/customercare/escalate/:bookingId
// Escalate an issue to higher management or admin
router.post('/escalate/:bookingId', auth(['customercare', 'admin']), escalateIssue);

module.exports = router;
