const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', default: null }, // Optional: link to a specific booking
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  type: { type: String, enum: ['system', 'message', 'alert'], default: 'message' }, // Type of notification
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);