const User = require('../models/User');
const Settings = require('../models/Settings');
const Booking = require('../models/Booking'); // Import Booking model
const bcrypt = require('bcryptjs');

// Get all users
const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password'); // hide password
    res.json(users);
  } catch (err) {
    console.error('❌ Error fetching users in adminController:', err);
    res.status(500).json({ message: 'Error fetching users', error: err.message });
  }
};

// Create a new user
const createUser = async (req, res) => {
  try {
    const { phone, password, role, profile } = req.body; // Destructure profile object
    console.log('Received data for user creation:', req.body); // Added console log

    // Extract name, email, and address from profile, or default to empty string if missing
    const name = profile?.name || ''; 
    const email = profile?.email || '';
    const address = profile?.address || '';

    if (!name || !phone || !password) {
      return res.status(400).json({ message: 'Name, phone and password are required' });
    }

    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({ message: 'Phone number already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({ 
      phone, 
      password: hashedPassword, 
      role,
      isVerified: true, // Assuming admin creates verified users
      profile: { name, email, address } // Set initial name, email, address in profile
    });
    const userObj = user.toObject();
    delete userObj.password; // remove password from response
    res.status(201).json(userObj);
  } catch (err) {
    console.error('❌ Error creating user in adminController:', err); // More specific error logging
    res.status(500).json({ message: 'Error creating user', error: err.message });
  }
};

// Update a user
const updateUser = async (req, res) => {
  try {
    const { password, profile, phone, ...rest } = req.body;
    console.log('Received data for user update:', req.body); // Added console log

    const updateFields = { ...rest };

    if (password) {
      updateFields.password = await bcrypt.hash(password, 10); // hash password if updated
    }
    if (phone) {
      updateFields.phone = phone;
    }
    if (profile) {
      updateFields.profile = profile;
    }

    const user = await User.findByIdAndUpdate(req.params.id, updateFields, { new: true }).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error('❌ Error updating user in adminController:', err); // More specific error logging
    res.status(500).json({ message: 'Error updating user', error: err.message });
  }
};

// Delete a user
const deleteUser = async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('❌ Error deleting user in adminController:', err);
    res.status(500).json({ message: 'Error deleting user', error: err.message });
  }
};

// NEW: Get logged-in admin's profile
const getAdminProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "Admin user not found" });
    }
    res.json(user);
  } catch (err) {
    console.error("❌ Admin profile fetch error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// NEW: Update logged-in admin's profile
const updateAdminProfile = async (req, res) => {
  try {
    const { profile, phone } = req.body; // Phone is typically not updated via profile edit

    const updateData = {};
    if (profile) updateData.profile = profile;
    // If phone is sent and allowed to be updated, add it here. For now, keeping it read-only.
    // if (phone) updateData.phone = phone; 

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "Admin user not found" });
    }

    res.json(updatedUser);
  } catch (err) {
    console.error("❌ Admin profile update error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// NEW: Update logged-in admin's password
const updateAdminPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current password and new password are required" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "Admin user not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("❌ Admin password update error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};


// Get site settings
const getSettings = async (req, res) => {
  try {
    // Find the first settings document or create one if none exists
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({
        siteName: 'AL CHAAN MEERA',
        bannerUrl: '',
        allowBookings: true
      });
    }
    res.json(settings);
  } catch (err) {
    console.error('❌ Error fetching settings in adminController:', err);
    res.status(500).json({ message: 'Error fetching settings', error: err.message });
  }
};

// Update site settings
const updateSettings = async (req, res) => {
  try {
    const { siteName, bannerUrl, allowBookings } = req.body;
    
    // Find the first settings document or create one if none exists
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({
        siteName: siteName || 'AL CHAAN MEERA',
        bannerUrl: bannerUrl || '',
        allowBookings: allowBookings !== undefined ? allowBookings : true,
        lastUpdated: new Date()
      });
    } else {
      // Update existing settings
      settings.siteName = siteName || settings.siteName;
      settings.bannerUrl = bannerUrl || settings.bannerUrl;
      settings.allowBookings = allowBookings !== undefined ? allowBookings : settings.allowBookings;
      settings.lastUpdated = new Date();
      await settings.save();
    }
    
    res.json(settings);
  } catch (err) {
    console.error('❌ Error updating settings in adminController:', err);
    res.status(500).json({ message: 'Error updating settings', error: err.message });
  }
};

// NEW: Assign an employee to a booking (Admin can also do this)
const assignEmployeeToBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { employeeId } = req.body;

    if (!employeeId) {
      return res.status(400).json({ message: 'Employee ID is required' });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const employee = await User.findById(employeeId);
    if (!employee || employee.role !== 'employee') {
      return res.status(400).json({ message: 'Invalid employee ID or user is not an employee' });
    }

    booking.employee = employeeId;
    booking.status = 'In Progress'; // Automatically set to In Progress when assigned
    await booking.save();

    res.json({ message: 'Employee assigned to booking successfully', booking });
  } catch (err) {
    console.error('❌ Error assigning employee to booking in adminController:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// NEW: Get all employees with their working status
const getAllEmployeeStatuses = async (req, res) => {
  try {
    // Select 'isWorking' directly from the database
    const employees = await User.find({ role: 'employee' }).select('profile.name phone isWorking');
    // Mongoose will automatically apply the virtual 'workingStatus' when converting to JSON/Object
    res.json(employees);
  } catch (err) {
    console.error('❌ Error fetching all employee statuses in adminController:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// NEW: Get all bookings for admin
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('user', 'profile.name phone profile.address')
      .populate('service', 'type price')
      .populate('employee', 'profile.name phone');
    res.json(bookings);
  } catch (err) {
    console.error('❌ Error fetching all bookings for admin:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// NEW: Update booking status by Admin
const updateBookingStatusByAdmin = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status, notes, finalAmount } = req.body; // NEW: Accept finalAmount
    const allowedStatuses = [
      'Pending', 
      'In Progress', 
      'Completed', 
      'Cancelled',
      'Pending - Weather', 
      'Pending - Customer Unavailable', 
      'Pending - Technical',
      'Completed - Awaiting Admin Confirmation' // NEW: Admin can also set this status
    ];

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Allowed values: ${allowedStatuses.join(', ')}` });
    }

    const updateFields = { status, notes };

    // If admin is marking as 'Completed' and providing a final amount
    if (status === 'Completed') {
      if (finalAmount === undefined || finalAmount === null || isNaN(Number(finalAmount))) {
        return res.status(400).json({ message: 'Final amount is required when marking a booking as Completed.' });
      }
      updateFields.finalAmount = Number(finalAmount);
      updateFields.adminConfirmed = true;
      updateFields['payment.amount'] = Number(finalAmount); // Update payment amount with final amount
      updateFields['payment.status'] = 'pending'; // Set payment status to pending for admin to collect
    } else {
      // If status is not 'Completed', ensure adminConfirmed and finalAmount are reset or not set
      updateFields.adminConfirmed = false;
      updateFields.finalAmount = 0;
    }

    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      updateFields,
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json({ message: 'Booking status updated successfully', booking });
  } catch (err) {
    console.error('Error updating booking status by admin:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};


module.exports = { 
  getUsers, 
  createUser, 
  updateUser, 
  deleteUser,
  getSettings,
  updateSettings,
  getAdminProfile,      // NEW: Export
  updateAdminProfile,   // NEW: Export
  updateAdminPassword,  // NEW: Export
  assignEmployeeToBooking, // NEW: Export
  getAllEmployeeStatuses, // NEW: Export
  getAllBookings, // NEW: Export
  updateBookingStatusByAdmin // NEW: Export
};