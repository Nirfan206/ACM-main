const mongoose = require('mongoose');

const callbackRequestSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  message: { type: String, default: 'Customer requested a callback' },
  status: { 
    type: String, 
    enum: ['pending', 'in_progress', 'completed'], 
    default: 'pending' 
  },
  notes: { type: String, default: '' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true }); // automatically adds createdAt and updatedAt

module.exports = mongoose.model('CallbackRequest', callbackRequestSchema);
