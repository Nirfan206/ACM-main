require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// ----------------------
// Route imports
// ----------------------
const authRoutes = require('./routes/auth');
const customerRoutes = require('./routes/customer');
const serviceRoutes = require('./routes/services');
const adminRoutes = require('./routes/admin');
const employeeRoutes = require('./routes/employee');
const reviewRoutes = require('./routes/reviews');
const analyticsRoutes = require('./routes/analytics');
const customerCareRoutes = require('./routes/customercare');
const callbackRoutes = require('./routes/callback');
const uploadRoutes = require('./routes/upload');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// ----------------------
// Middlewares
// ----------------------
app.use(express.json());
app.use(cors());

// ----------------------
// API Routes
// ----------------------
app.use('/api/auth', authRoutes);
app.use('/api/customer', customerRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/employee', employeeRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/customercare', customerCareRoutes);
app.use('/api/callback-requests', callbackRoutes);
app.use('/api/upload', uploadRoutes);

// ----------------------
// Serve React Frontend (Production)
// ----------------------
const __dirname1 = path.resolve();

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname1, "../client/build")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname1, "../client/build/index.html"));
  });
} else {
  app.get("/", (req, res) => {
    res.send("🚀 AL CHAAN MEERA API is running...");
  });
}

// ----------------------
// Error Handler
// ----------------------
app.use(errorHandler);

// ----------------------
// Database Connection
// ----------------------
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  autoIndex: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4 // Use IPv4
})
.then(() => {
  console.log("✅ MongoDB connected");
  app.listen(PORT, () =>
    console.log(`🔥 Server running on port ${PORT}`)
  );
})
.catch((err) => {
  console.error("❌ MongoDB connection error:", err.message);
  process.exit(1);
});
