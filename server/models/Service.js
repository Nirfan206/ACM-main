const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  type: { type: String, required: true },
  description: { type: String, default: '' },
  // price: { type: Number, required: true }, // Removed price field
  category: { 
    type: String, 
    enum: ['AC', 'Fridge', 'Washing Machine', 'Plumbing', 'Electrical', 'Other'], 
    default: 'Other' 
  },
  imageUrl: { type: String, default: '' }, // New field for service image URL
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
}, { timestamps: true }); // adds createdAt and updatedAt automatically

module.exports = mongoose.model('Service', serviceSchema);