const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const {
  getJobs,
  updateJobStatus,
  getEmployeeEarnings,
  getEmployeeProfile,    
  updateEmployeeProfile, 
  updateEmployeePassword, 
  getWorkingStatus,      
  toggleWorkingStatus    
} = require('../controllers/employeeController');

// ---------------------------
// Employee Profile Routes
// ---------------------------

// GET /api/employee/profile - fetch logged-in employee's profile
router.get('/profile', auth(['employee']), getEmployeeProfile);

// PUT /api/employee/profile - update employee's profile
router.put('/profile', auth(['employee']), updateEmployeeProfile);

// PUT /api/employee/password - update employee's password
router.put('/password', auth(['employee']), updateEmployeePassword);


// ---------------------------
// Employee Job Routes
// ---------------------------

// GET /api/employee/jobs
// Fetch all jobs assigned to the logged-in employee
router.get('/jobs', auth(['employee']), getJobs);

// PUT /api/employee/jobs/:id
// Update the status of a specific job (e.g., in-progress, completed)
router.put('/jobs/:id', auth(['employee']), updateJobStatus);

// GET /api/employee/earnings
// Fetch earnings and commission for the logged-in employee
router.get('/earnings', auth(['employee']), getEmployeeEarnings);

// ---------------------------
// Employee Working Status Routes
// ---------------------------

// Adding a console log to verify getWorkingStatus
console.log('getWorkingStatus after import:', getWorkingStatus);

// GET /api/employee/status - Get current working status
router.get('/status', auth(['employee']), getWorkingStatus);

// PUT /api/employee/status/toggle - Toggle working status
router.put('/status/toggle', auth(['employee']), toggleWorkingStatus);


module.exports = router;