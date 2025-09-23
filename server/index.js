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

// A more secure CORS setup for production
if (process.env.NODE_ENV === "production") {
    // Replace this with your actual frontend's domain
    const allowedOrigins = ['https://your-frontend-domain.com']; 
    
    app.use(cors({
        origin: function (origin, callback) {
            if (!origin || allowedOrigins.indexOf(origin) !== -1) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        }
    }));
} else {
    // Allow all origins in development
    app.use(cors());
}

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
if (process.env.NODE_ENV === "production") {
  const buildPath = path.join(__dirname, "../client/build");
  app.use(express.static(buildPath));

  app.get("*", (req, res) => {
    res.sendFile(path.join(buildPath, "index.html"));
  });
} else {
  app.get("/", (req, res) => {
    res.send("🚀 AL CHAAN MEERA API (Development) is running...");
  });
}

// ----------------------
// Error Handler (should be after routes)
// ----------------------
app.use(errorHandler);

// ----------------------
// Server and Database Connection
// ----------------------
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
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
