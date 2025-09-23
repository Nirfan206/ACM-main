const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema(
  {
    type: { type: String, required: true },
    description: { type: String, default: '' },
    category: {
      type: String,
      enum: ['AC', 'Fridge', 'Washing Machine', 'Plumbing', 'Electrical', 'Other'],
      default: 'Other'
    },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Service', serviceSchema);
