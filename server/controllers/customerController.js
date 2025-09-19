// controllers/customer.controller.js
const Booking = require('../models/Booking');

/**
 * GET /api/customer/bookings
 * Fetch all bookings for the logged-in user
 */
const getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate('service', 'type price') // Populate service to get type and price
      .populate('employee', 'profile.name phone profile.address'); // Populate employee to get name, phone, and address
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching bookings', error: err.message });
  }
};

/**
 * POST /api/customer/bookings
 * Create a new booking for the logged-in user
 */
const createBooking = async (req, res) => {
  try {
    // Optional: Add validation for required fields here
    const booking = await Booking.create({ ...req.body, user: req.user.id });
    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ message: 'Error creating booking', error: err.message });
  }
};

/**
 * PUT /api/customer/bookings/:id
 * Update a booking belonging to the logged-in user
 */
const updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true }
    );
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: 'Error updating booking', error: err.message });
  }
};

/**
 * DELETE /api/customer/bookings/:id
 * Delete a booking belonging to the logged-in user
 */
const deleteBooking = async (req, res) => {
  try {
    const deleted = await Booking.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!deleted) return res.status(404).json({ message: 'Booking not found' });
    res.json({ message: 'Booking deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting booking', error: err.message });
  }
};

module.exports = { getBookings, createBooking, updateBooking, deleteBooking };