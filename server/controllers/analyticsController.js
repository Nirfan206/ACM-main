const Booking = require('../models/Booking');
const User = require('../models/User');

const getAnalytics = async (req, res) => {
  try {
    // Total bookings
    const totalBookings = await Booking.countDocuments();

    // Removed: Total revenue calculation

    // Employee performance (only job counts, no financial metrics)
    const employeePerformance = await User.aggregate([
      { $match: { role: 'employee' } },
      { $lookup: {
          from: 'bookings',
          localField: '_id',
          foreignField: 'employee',
          as: 'jobs'
      }},
      { $project: {
          name: { $ifNull: ['$profile.name', '$name'] },
          jobsCompleted: {
            $size: {
              $filter: {
                input: '$jobs',
                as: 'job',
                cond: { $eq: ['$$job.status', 'Completed'] }
              }
            }
          },
          isWorking: { $ifNull: ['$isWorking', false] } // Ensure isWorking is always a boolean, default to false
      }}
    ]);

    // --- DEBUG LOGS ---
    console.log('--- Analytics Data from Backend ---');
    console.log('Total Bookings:', totalBookings);
    // console.log('Total Revenue:', totalRevenue); // Removed
    console.log('Employee Performance (non-financial):', JSON.stringify(employeePerformance, null, 2));
    console.log('-----------------------------------');
    // --- END DEBUG LOGS ---

    res.json({ totalBookings, employeePerformance }); // Removed totalRevenue
  } catch (err) {
    res.status(500).json({ message: 'Error fetching analytics', error: err.message });
  }
};

module.exports = { getAnalytics };