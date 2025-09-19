// scripts/createAdmin.js
require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Changed from 'bcrypt' to 'bcryptjs'
const User = require('../models/User');

async function createAdminAccount() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      autoIndex: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4 // Use IPv4, skip trying IPv6
    });
    console.log('✅ MongoDB connected');

    // Check if admin already exists
    const adminPhone = '9999999999'; // Default admin phone
    const existingAdmin = await User.findOne({ phone: adminPhone, role: 'admin' });
    
    if (existingAdmin) {
      console.log('⚠️ Admin account already exists with phone:', adminPhone);
      mongoose.connection.close();
      return;
    }

    // Create admin password
    const password = 'admin123'; // Default password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin user
    const admin = new User({
      phone: adminPhone,
      password: hashedPassword,
      role: 'admin',
      isVerified: true,
      profile: {
        name: 'Admin User',
        email: 'admin@alchaan.com',
        address: 'Admin Office'
      }
    });

    await admin.save();
    console.log('✅ Admin account created successfully!');
    console.log('Phone: ' + adminPhone);
    console.log('Password: ' + password);
    console.log('Role: admin');

  } catch (error) {
    console.error('❌ Error creating admin account:', error);
  } finally {
    mongoose.connection.close();
  }
}

createAdminAccount();