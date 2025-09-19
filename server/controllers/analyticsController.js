const Booking = require('../models/Booking');
const User = require('../models/User');

const getAnalytics = async (req, res) => {
  try {
    // Total bookings
    const totalBookings = await Booking.countDocuments();

    // Total revenue (only from completed bookings, regardless of payment status)
    const totalRevenueAgg = await Booking.aggregate([
      {
        $match: {
          status: 'Completed', // Only count completed bookings
          // Removed: 'payment.status': 'paid' // Now includes all completed bookings
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: { $ifNull: ['$payment.amount', 0] } }
        }
      }
    ]);
    const totalRevenue = totalRevenueAgg[0]?.total || 0;

    // Employee performance
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
    console.log('Total Revenue:', totalRevenue);
    console.log('Employee Performance:', JSON.stringify(employeePerformance, null, 2));
    console.log('-----------------------------------');
    // --- END DEBUG LOGS ---

    res.json({ totalBookings, totalRevenue, employeePerformance });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching analytics', error: err.message });
  }
};

module.exports = { getAnalytics };