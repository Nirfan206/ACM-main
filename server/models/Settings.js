const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  siteName: { type: String, default: 'AL CHAAN MEERA' },
  bannerUrl: { type: String, default: '' },
  allowBookings: { type: Boolean, default: true },
  lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true }); // adds createdAt and updatedAt automatically

module.exports = mongoose.model('Settings', settingsSchema);