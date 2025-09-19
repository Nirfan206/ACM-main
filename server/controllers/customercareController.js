const Booking = require('../models/Booking');
const CallbackRequest = require('../models/CallbackRequest');
const User = require('../models/User'); // Import User model
const Notification = require('../models/Notification'); // NEW: Import Notification model
// const twilioClient = require('../config/twilio'); // Removed Twilio client import
const bcrypt = require('bcryptjs'); // Import bcryptjs for password hashing

/**
 * GET /api/customercare/requests (now getBookingRequests)
 * Fetch bookings with status Pending or In Progress for customer care attention.
 */
const getBookingRequests = async (req, res) => {
  try {
    const requests = await Booking.find({ status: { $in: ['Pending', 'In Progress', 'Completed - Awaiting Admin Confirmation'] } }) // Include new status
      .populate('user', 'profile.name phone profile.address') // Populate user to get customer name, phone, and address
      .populate('service', 'type') // Populate service to get service type
      .populate('employee', 'profile.name'); // Populate assigned employee name
    res.json(requests);
  } catch (err) {
    console.error('Error fetching booking requests:', err);
    res.status(500).json({ message: 'Error fetching booking requests', error: err.message });
  }
};

/**
 * GET /api/customercare/callback-requests
 * Fetch all callback requests for customer care to manage.
 */
const getCallbackRequests = async (req, res) => {
  try {
    const requests = await CallbackRequest.find()
      .populate('assignedTo', 'profile.name role') // Populate assigned employee/admin
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    console.error('Error fetching callback requests:', err);
    res.status(500).json({ message: 'Error fetching callback requests', error: err.message });
  }
};

/**
 * POST /api/customercare/notify
 * Notify the customer about service progress via SMS and store in notifications
 */
const notifyCustomer = async (req, res) => {
  const { bookingId, message } = req.body;

  try {
    if (!bookingId || !message) {
      return res.status(400).json({ message: 'Booking ID and message are required' });
    }

    const booking = await Booking.findById(bookingId).populate('user', 'phone');
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    if (!booking.user || !booking.user.phone) {
      return res.status(404).json({ message: 'Customer phone number not found for this booking' });
    }

    const customerPhone = booking.user.phone;
    
    // Removed Twilio SMS sending logic. Now it just logs a message.
    console.log(`[SMS Notification Mock] Sending message to ${customerPhone} for Booking ${bookingId.substring(0, 8)}: ${message}`);

    // NEW: Store the message in the Notification model
    await Notification.create({
      user: booking.user._id,
      booking: booking._id,
      message: message,
      type: 'message',
      read: false,
    });

    res.json({ message: `Customer for booking ${bookingId} notified and message saved.` });
  } catch (err) {
    console.error('Error notifying customer:', err);
    res.status(500).json({ message: 'Error notifying customer', error: err.message });
  }
};

/**
 * POST /api/customercare/escalate/:bookingId
 * Escalate issue to admin
 */
const escalateIssue = async (req, res) => {
  const { bookingId } = req.params;

  try {
    // TODO: Implement escalation logic, e.g., send email or push notification to admin
    // For now, just log and send a success message
    console.log(`Issue for booking ${bookingId} escalated to admin by ${req.user.id}`);
    res.json({ message: `Issue for booking ${bookingId} escalated to admin` });
  } catch (err) {
    res.status(500).json({ message: 'Error escalating issue', error: err.message });
  }
};

// NEW: Assign an employee to a booking
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
    console.error('Error assigning employee to booking:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// NEW: Update booking status by Customer Care
const updateBookingStatusByCare = async (req, res) => {
  try {
    const { bookingId } = req.params;
    let { status, notes } = req.body; // Use 'let' because status might be modified
    const allowedStatuses = ['Pending', 'In Progress', 'Completed', 'Cancelled'];

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Allowed values: ${allowedStatuses.join(', ')}` });
    }

    // If customer care marks as 'Completed', set it to 'Completed - Awaiting Admin Confirmation'
    if (status === 'Completed') {
      status = 'Completed - Awaiting Admin Confirmation';
    }

    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      { status, notes },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json({ message: 'Booking status updated successfully', booking });
  } catch (err) {
    console.error('Error updating booking status by customer care:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// NEW: Get all customers (for Customer Care)
const getCustomers = async (req, res) => {
  try {
    const customers = await User.find({ role: 'customer' }).select('-password');
    res.json(customers);
  } catch (err) {
    console.error('Error fetching customers for customer care:', err);
    res.status(500).json({ message: 'Error fetching customers', error: err.message });
  }
};

// NEW: Create a customer (for Customer Care)
const createCustomer = async (req, res) => {
  try {
    const { name, phone, password, email, address } = req.body;

    if (!name || !phone || !password) {
      return res.status(400).json({ message: 'Name, phone, and password are required' });
    }

    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({ message: 'Phone number already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({ 
      phone, 
      password: hashedPassword, 
      role: 'customer',
      isVerified: true, 
      profile: { name, email, address }
    });
    const userObj = user.toObject();
    delete userObj.password; 
    res.status(201).json(userObj);
  } catch (err) {
    console.error('Error creating customer by customer care:', err);
    res.status(500).json({ message: 'Error creating customer', error: err.message });
  }
};

// NEW: Update a customer (for Customer Care)
const updateCustomer = async (req, res) => {
  try {
    const { password, profile, phone, ...rest } = req.body;

    const updateFields = { ...rest };

    if (password) {
      updateFields.password = await bcrypt.hash(password, 10); 
    }
    if (phone) {
      updateFields.phone = phone;
    }
    if (profile) {
      updateFields.profile = profile;
    }

    const user = await User.findByIdAndUpdate(req.params.id, updateFields, { new: true }).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.json(user);
  } catch (err) {
    console.error('Error updating customer by customer care:', err);
    res.status(500).json({ message: 'Error updating customer', error: err.message });
  }
};

// NEW: Get logged-in customer care's profile
const getCustomerCareProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "Customer Care user not found" });
    }
    res.json(user);
  } catch (err) {
    console.error("❌ Customer Care profile fetch error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// NEW: Update logged-in customer care's profile
const updateCustomerCareProfile = async (req, res) => {
  try {
    const { profile, phone } = req.body; 

    const updateData = {};
    if (profile) updateData.profile = profile;
    // if (phone) updateData.phone = phone; // Phone typically not updated via profile edit

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "Customer Care user not found" });
    }

    res.json(updatedUser);
  } catch (err) {
    console.error("❌ Customer Care profile update error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// NEW: Update logged-in customer care's password
const updateCustomerCarePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current password and new password are required" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "Customer Care user not found" });
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
    console.error("❌ Customer Care password update error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};


module.exports = { 
  getBookingRequests, 
  getCallbackRequests, 
  notifyCustomer, 
  escalateIssue,
  assignEmployeeToBooking, // Export new function
  updateBookingStatusByCare, // Export new function
  getCustomers, // Export new function
  createCustomer, // Export new function
  updateCustomer, // Export new function
  getCustomerCareProfile, // Export new function
  updateCustomerCareProfile, // Export new function
  updateCustomerCarePassword // Export new function
};