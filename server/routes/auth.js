const express = require('express');
const router = express.Router();
const {
  requestCallback,
  register,
  login,
  passwordReset
} = require('../controllers/authController'); // Import functions from the consolidated controller

// ---------------------------
// AUTHENTICATION ROUTES
// ---------------------------

// POST /api/auth/request-callback - Customer requests a callback
router.post('/request-callback', requestCallback);

// POST /api/auth/register - Register a new user
router.post('/register', register);

// POST /api/auth/login - Log in a user
router.post('/login', login);

// POST /api/auth/password-reset - Reset user password
router.post('/password-reset', passwordReset);

module.exports = router;