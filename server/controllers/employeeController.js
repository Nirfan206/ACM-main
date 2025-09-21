const Booking = require('../models/Booking');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

/**
 * GET /api/employee/jobs
 * Fetch all jobs assigned to the logged-in employee
 */
const getJobs = async (req, res) => {
  console.log(`[EmployeeController] getJobs called for employee ID: ${req.user.id}`); // Added log
  try {
    const jobs = await Booking.find({ employee: req.user.id })
      .populate('service', 'type') // Populate service to get type (removed price)
      .populate('user', 'profile.name phone profile.address'); // Populate user to get customer name, phone, and address
    
    console.log(`[EmployeeController] Found ${jobs.length} jobs for employee ID: ${req.user.id}`); // Added log
    res.json(jobs);
  } catch (err) {
    console.error(`[EmployeeController] Error fetching jobs for employee ID ${req.user.id}:`, err.message); // Added log
    res.status(500).json({ message: 'Error fetching jobs', error: err.message });
  }
};

/**
 * PUT /api/employee/jobs/:id
 * Update the status and notes of a job assigned to the logged-in employee
 */
const updateJobStatus = async (req, res) => {
  try {
    const allowedStatuses = [
      'Pending', 
      'In Progress', 
      'Completed', // This will be internally mapped to 'Completed - Awaiting Admin Confirmation'
      'Cancelled',
      'Pending - Weather', 
      'Pending - Customer Unavailable', 
      'Pending - Technical'
    ];
    let { status, notes } = req.body; // Accept notes

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    // If employee marks as 'Completed', set it to 'Completed - Awaiting Admin Confirmation'
    if (status === 'Completed') {
      status = 'Completed - Awaiting Admin Confirmation';
    }

    const job = await Booking.findOneAndUpdate(
      { _id: req.params.id, employee: req.user.id },
      { status, notes }, // Save notes
      { new: true }
    );

    if (!job) return res.status(404).json({ message: 'Job not found or not assigned to this employee' });

    res.json(job);
  } catch (err) {
    res.status(500).json({ message: 'Error updating job status', error: err.message });
  }
};

/**
 * GET /api/employee/earnings
 * Fetch job summary for the logged-in employee (removed earnings/commission)
 */
const getEmployeeEarnings = async (req, res) => {
  try {
    const employeeId = req.user.id;

    // Find all bookings for this employee
    const allBookings = await Booking.find({ employee: employeeId });

    let completedJobs = 0;
    let inProgressJobs = 0;
    let pendingJobs = 0;
    let cancelledJobs = 0;

    allBookings.forEach(booking => {
      if (booking.status === 'Completed') {
        completedJobs++;
      } else if (booking.status === 'In Progress') {
        inProgressJobs++;
      } else if (booking.status.startsWith('Pending') || booking.status === 'Completed - Awaiting Admin Confirmation') {
        pendingJobs++;
      } else if (booking.status === 'Cancelled') {
        cancelledJobs++;
      }
    });

    res.json({
      jobSummary: {
        totalAssigned: allBookings.length,
        completed: completedJobs,
        inProgress: inProgressJobs,
        pending: pendingJobs,
        cancelled: cancelledJobs,
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching employee job summary', error: err.message });
  }
};

// Get logged-in employee's profile
const getEmployeeProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "Employee user not found" });
    }
    res.json(user);
  } catch (err) {
    console.error("❌ Employee profile fetch error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Update logged-in employee's profile
const updateEmployeeProfile = async (req, res) => {
  try {
    const { profile, phone } = req.body; 

    const updateData = {};
    if (profile) updateData.profile = profile;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "Employee user not found" });
    }

    res.json(updatedUser);
  } catch (err) {
    console.error("❌ Employee profile update error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Update logged-in employee's password
const updateEmployeePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current password and new password are required" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "Employee user not found" });
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
    console.error("❌ Employee password update error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Get employee's current working status
const getWorkingStatus = async (req, res) => {
  try {
    const employee = await User.findById(req.user.id).select('isWorking'); // Select isWorking
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    // Use the virtual 'workingStatus' for consistency in response
    const currentStatus = employee.workingStatus; 
    console.log(`[Server - getWorkingStatus] Employee ID: ${req.user.id}, DB isWorking: ${employee.isWorking}, Sending Status: ${currentStatus}`);
    res.json({ workingStatus: currentStatus });
  } catch (err) {
    console.error('Error fetching working status:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Toggle employee's working status
const toggleWorkingStatus = async (req, res) => {
  try {
    const employeeId = req.user.id;
    const employee = await User.findById(employeeId).select('isWorking'); // Select isWorking

    if (!employee) {
      console.log(`[Toggle Status] Employee with ID ${employeeId} not found.`);
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Determine new boolean status based on current boolean status
    const currentIsWorking = employee.isWorking;
    const newIsWorking = !currentIsWorking;

    console.log(`[Toggle Status] Employee ID: ${employeeId}, Current isWorking: ${currentIsWorking}, Attempting to set to: ${newIsWorking}`);

    const updatedEmployee = await User.findByIdAndUpdate(
      employeeId,
      { isWorking: newIsWorking }, // Update isWorking field
      { new: true } // Return the full updated document
    );

    if (!updatedEmployee) {
      console.log(`[Toggle Status] Failed to update employee with ID ${employeeId}.`);
      return res.status(500).json({ message: 'Failed to update working status' });
    }

    console.log(`[Server - toggleWorkingStatus] Updated Employee object (full):`, updatedEmployee);
    console.log(`[Server - toggleWorkingStatus] Status after update (virtual): ${updatedEmployee.workingStatus}`);

    res.json({ message: 'Working status updated successfully', workingStatus: updatedEmployee.workingStatus });
  } catch (err) {
    console.error('Error toggling working status:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};


module.exports = { 
  getJobs, 
  updateJobStatus, 
  getEmployeeEarnings,
  getEmployeeProfile,
  updateEmployeeProfile,
  updateEmployeePassword,
  getWorkingStatus,     
  toggleWorkingStatus   
};