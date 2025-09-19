const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['customer', 'employee', 'admin', 'customercare'], default: 'customer' },
  isVerified: { type: Boolean, default: false },
  profile: {
    name: { type: String, default: '' },
    address: { type: String, default: '' },
    email: { type: String, default: '' }
  },
  blocked: { type: Boolean, default: false },
  isWorking: { type: Boolean, default: false }, // Changed from workingStatus to isWorking (boolean)
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }); // Enable virtuals

// Virtual for workingStatus (string 'free'/'working')
userSchema.virtual('workingStatus').get(function() {
  return this.isWorking ? 'working' : 'free';
});

userSchema.virtual('workingStatus').set(function(value) {
  this.isWorking = (value === 'working');
});

module.exports = mongoose.model('User', userSchema);