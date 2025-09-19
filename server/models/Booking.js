const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // optional employee assignment
  date: { type: Date, required: true },
  time: { type: String, required: true },
  address: { type: String, default: '' },
  notes: { type: String, default: '' },
  problemDescription: { type: String, default: '' }, // NEW: Field to store customer's problem description
  status: { 
    type: String, 
    enum: [
      'Pending', 
      'In Progress', 
      'Completed', 
      'Cancelled',
      'Pending - Weather', 
      'Pending - Customer Unavailable', 
      'Pending - Technical',
      'Completed - Awaiting Admin Confirmation' // NEW: Status for admin review
    ], 
    default: 'Pending' 
  },
  payment: {
    amount: { type: Number, default: 0 },
    method: { type: String, default: 'Not Paid' },
    status: { type: String, enum: ['paid', 'failed', 'pending'] }

  },
  finalAmount: { type: Number, default: 0 }, // NEW: Final amount after service, set by admin
  adminConfirmed: { type: Boolean, default: false }, // NEW: Flag for admin confirmation
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true }); // adds updatedAt automatically

module.exports = mongoose.model('Booking', bookingSchema);