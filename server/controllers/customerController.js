const Booking = require('../models/Booking');
const Notification = require('../models/Notification'); // --- 1. ADD THIS LINE ---

/**
 * GET /api/customer/bookings
 * Fetch all bookings for the logged-in user
 */
const getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate('service', 'type')
      .populate('employee', 'profile.name phone profile.address');
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
    if (!deleted) return res.status(4404).json({ message: 'Booking not found' });
    res.json({ message: 'Booking deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting booking', error: err.message });
  }
};

// --- 2. ADD THIS NEW FUNCTION ---
/**
 * GET /api/customer/notifications
 * Fetch all notifications for the logged-in customer
 */
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id }).sort({ createdAt: -1 });
    // This will correctly send an empty array [] if no notifications are found
    res.status(200).json(notifications);
  } catch (err) {
    console.error("Error fetching notifications:", err.message);
    res.status(500).json({ message: "Server Error" });
  }
};
// --- END OF NEW FUNCTION ---

module.exports = {
  getBookings,
  createBooking,
  updateBooking,
  deleteBooking,
  getNotifications // --- 3. ADD THIS TO YOUR EXPORTS ---
};
