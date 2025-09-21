const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');
const Service = require('../models/Service');
const Booking = require('../models/Booking');

async function seed() {
  try {
    // Connect to DB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected');

    // Clear existing data
    await Promise.all([
      User.deleteMany(),
      Service.deleteMany(),
      Booking.deleteMany(),
    ]);
    console.log('🗑 Old data removed');

    // Insert Users
    const users = await User.insertMany([
      {
        phone: '+10000000001',
        password: '$2b$10$aQBdhaV4QZTlcRyGM/Hk2O53mzh/3ZvUKGcGt6zj7i1Td./frr9pu', // bcrypt hash for 'admin123'
        role: 'customer',
        isVerified: true,
        profile: { name: 'Alice', address: '123 Main St', email: 'alice@example.com' },
      },
      {
        phone: '+10000000002',
        password: '$2b$10$aQBdhaV4QZTlcRyGM/Hk2O53mzh/3ZvUKGcGt6zj7i1Td./frr9pu', // bcrypt hash for 'admin123'
        role: 'employee',
        isVerified: true,
        isWorking: true, // Set to true for testing 'Working' status
        profile: { name: 'Bob', address: '456 Elm St', email: 'bob@example.com' },
      },
      {
        phone: '+10000000003',
        password: '$2b$10$aQBdhaV4QZTlcRyGM/Hk2O53mzh/3ZvUKGcGt6zj7i1Td./frr9pu', // bcrypt hash for 'admin123'
        role: 'admin',
        isVerified: true,
        profile: { name: 'Admin', address: 'HQ', email: 'admin@example.com' },
      },
      {
        phone: '+10000000004',
        password: '$2b$10$aQBdhaV4QZTlcRyGM/Hk2O53mzh/3ZvUKGcGt6zj7i1Td./frr9pu', // bcrypt hash for 'admin123'
        role: 'customercare',
        isVerified: true,
        profile: { name: 'Care', address: 'Support', email: 'care@example.com' },
      },
      {
        phone: '9999999999', // Admin user from createAdmin.js
        password: '$2b$10$aQBdhaV4QZTlcRyGM/Hk2O53mzh/3ZvUKGcGt6zj7i1Td./frr9pu', // bcrypt hash for 'admin123'
        role: 'admin',
        isVerified: true,
        profile: { name: 'Admin User', email: 'admin@alchaan.com', address: 'Admin Office' },
      },
      {
        phone: '+919876543210', // Another employee for testing
        password: '$2b$10$aQBdhaV4QZTlcRyGM/Hk2O53mzh/3ZvUKGcGt6zj7i1Td./frr9pu', // bcrypt hash for 'admin123'
        role: 'employee',
        isVerified: true,
        isWorking: false, // Set to false for testing 'Free' status
        profile: { name: 'Jaswanth', address: '789 Pine St', email: 'jaswanth@example.com' },
      },
    ]);
    console.log('👥 Users seeded');

    // Insert Services
    const services = await Service.insertMany([
      {
        type: 'AC Repair',
        description: 'Air conditioner repair and maintenance',
        category: 'AC',
        imageUrl: '/ac 1.jpeg', // Added image URL
        status: 'active',
      },
      {
        type: 'Fridge Repair',
        description: 'Refrigerator service',
        category: 'Fridge',
        imageUrl: '/fridge 1.jpeg', // Added image URL
        status: 'active',
      },
      {
        type: 'Plumbing',
        description: 'Plumbing services',
        category: 'Plumbing',
        imageUrl: '/a i o.jpeg', // Placeholder image URL
        status: 'active',
      },
      {
        type: 'Washing Machine Repair',
        description: 'Washing machine repair and maintenance',
        category: 'Washing Machine',
        imageUrl: '/wm 1.jpeg', // Added image URL
        status: 'active',
      },
    ]);
    console.log('🛠 Services seeded');

    // Insert Bookings
    await Booking.insertMany([
      {
        service: services[0]._id,
        user: users[0]._id, // Alice
        employee: users[1]._id, // Bob
        date: new Date(),
        time: '10:00',
        address: '123 Main St',
        status: 'Completed', 
        adminConfirmed: true, 
      },
      {
        service: services[1]._id,
        user: users[0]._id, // Alice
        employee: users[5]._id, // Jaswanth
        date: new Date(new Date().setDate(new Date().getDate() + 1)), // Tomorrow
        time: '14:00',
        address: '123 Main St',
        status: 'Completed - Awaiting Admin Confirmation', 
        adminConfirmed: false, 
      },
      {
        service: services[2]._id,
        user: users[0]._id, // Alice
        employee: users[1]._id, // Bob
        date: new Date(new Date().setDate(new Date().getDate() - 2)), // Two days ago
        time: '09:00',
        address: '123 Main St',
        status: 'In Progress', 
        adminConfirmed: false,
      },
    ]);
    console.log('📅 Bookings seeded');

    console.log('✅ Sample data seeded successfully');
  } catch (err) {
    console.error('❌ Error seeding data:', err);
  } finally {
    mongoose.connection.close();
  }
}

seed();