// routes/callback.js
const express = require('express');
const router = express.Router();
const CallbackRequest = require('../models/CallbackRequest');
const auth = require('../middlewares/authMiddleware');

// -----------------------------
// Create a new callback request
// (Open route: customer can request without login)
// -----------------------------
router.post('/', async (req, res) => {
  try {
    const { name, phone, message } = req.body;
    if (!name || !phone) {
      return res.status(400).json({ message: 'Name and phone are required' });
    }

    const request = await CallbackRequest.create({
      name,
      phone,
      message: message || 'Customer requested a callback',
      status: 'pending'
    });

    res.status(201).json(request);
  } catch (err) {
    console.error('Error creating callback request:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// -----------------------------
// Get all callback requests
// (Protected: customer care & admin)
// -----------------------------
router.get('/', auth(['customercare', 'admin']), async (req, res) => {
  try {
    const requests = await CallbackRequest.find()
      .populate('assignedTo', 'profile.name role')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    console.error('Error fetching callback requests:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// -----------------------------
// Get specific callback request by ID
// (Protected: customer care & admin)
// -----------------------------
router.get('/:id', auth(['customercare', 'admin']), async (req, res) => {
  try {
    const request = await CallbackRequest.findById(req.params.id).populate('assignedTo', 'profile.name role');
    if (!request) {
      return res.status(404).json({ message: 'Callback request not found' });
    }
    res.json(request);
  } catch (err) {
    console.error('Error fetching callback request:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// -----------------------------
// Update callback request status & notes
// (Protected: customer care & admin)
// -----------------------------
router.put('/:id', auth(['customercare', 'admin']), async (req, res) => {
  try {
    const { status, notes } = req.body;
    const allowedStatuses = ['pending', 'in_progress', 'completed'];

    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Allowed values: ${allowedStatuses.join(', ')}`
      });
    }

    const updatedRequest = await CallbackRequest.findByIdAndUpdate(
      req.params.id,
      {
        status,
        notes,
        assignedTo: req.user.id
      },
      { new: true }
    ).populate('assignedTo', 'profile.name role');

    if (!updatedRequest) {
      return res.status(404).json({ message: 'Callback request not found' });
    }

    res.json(updatedRequest);
  } catch (err) {
    console.error('Error updating callback request:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// -----------------------------
// Delete a callback request
// (Protected: admin only)
// -----------------------------
router.delete('/:id', auth(['admin']), async (req, res) => {
  try {
    const deleted = await CallbackRequest.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Callback request not found' });
    }
    res.json({ message: 'Callback request deleted successfully' });
  } catch (err) {
    console.error('Error deleting callback request:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
