const User = require('../models/User');
const CallbackRequest = require('../models/CallbackRequest');
const bcrypt = require('bcryptjs'); // Standardizing to bcryptjs
const jwt = require('jsonwebtoken');

// POST /api/auth/request-callback
const requestCallback = async (req, res) => {
  const { name, phone, message } = req.body;
  try {
    if (!phone) return res.status(400).json({ message: 'Phone is required' });
    if (!name) return res.status(400).json({ message: 'Name is required' });

    const callbackRequest = new CallbackRequest({
      name,
      phone,
      message: message || 'Customer requested a callback',
      status: 'pending'
    });

    await callbackRequest.save();
    res.status(200).json({ message: 'Callback request received. Our team will contact you shortly.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to request callback', error: err.message });
  }
};

// POST /api/auth/register
const register = async (req, res) => {
  const { name, phone, password, role = 'customer' } = req.body;
  try {
    if (!name || !phone || !password) 
      return res.status(400).json({ message: 'Name, phone, and password are required' });

    const existing = await User.findOne({ phone });
    if (existing) return res.status(400).json({ message: 'Phone already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      phone,
      password: hashedPassword,
      role,
      isVerified: true, // Skip OTP verification
      profile: { name }
    });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: user._id,
        phone: user.phone,
        name: user.profile.name,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Registration error', error: err.message });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  const { phone, password } = req.body;
  try {
    if (!phone || !password) 
      return res.status(400).json({ message: 'Phone and password are required' });

    const user = await User.findOne({ phone });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user._id,
        phone: user.phone,
        name: user.profile?.name,
        role: user.role
      }
    });
  } catch (err) {
    // Added more detailed logging for server-side errors during login
    console.error('❌ Server-side Login Error:', err); 
    res.status(500).json({ message: 'Login error', error: err.message });
  }
};

// POST /api/auth/password-reset
const passwordReset = async (req, res) => {
  const { phone, newPassword } = req.body;
  try {
    if (!phone || !newPassword) 
      return res.status(400).json({ message: 'Phone and new password are required' });

    const user = await User.findOne({ phone });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.findOneAndUpdate({ phone }, { password: hashedPassword });

    res.json({ message: 'Password reset successful' });
  } catch (err) {
    res.status(500).json({ message: 'Password reset error', error: err.message });
  }
};

module.exports = { requestCallback, register, login, passwordReset };