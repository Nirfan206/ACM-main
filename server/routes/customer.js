// routes/customer.js
const express = require("express");
const router = express.Router();
const auth = require("../middlewares/authMiddleware");
// Use User model instead of Customer model
const User = require("../models/User");
const {
  getBookings,
  createBooking,
  updateBooking,
  deleteBooking,
} = require("../controllers/customerController");

// ---------------------------
// Customer Profile Routes
// ---------------------------

// GET /api/customer/profile - fetch logged-in customer's profile
router.get("/profile", auth(["customer"]), async (req, res) => {
  try {
    const User = require("../models/User");
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (err) {
    console.error("❌ Profile fetch error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/customer/profile - update profile
router.put("/profile", auth(["customer"]), async (req, res) => {
  try {
    const User = require("../models/User");
    const { profile, phone } = req.body;

    const updateData = {};
    if (phone) updateData.phone = phone;
    if (profile) updateData.profile = profile;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(updatedUser);
  } catch (err) {
    console.error("❌ Profile update error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/customer/password - update password
router.put("/password", auth(["customer"]), async (req, res) => {
  try {
    const User = require("../models/User");
    const bcrypt = require("bcryptjs");
    const { currentPassword, newPassword } = req.body;

    // Validate request
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current password and new password are required" });
    }

    // Get user with password
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Hash new password and update
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("❌ Password update error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// ---------------------------
// Customer Booking Routes
// ---------------------------

router.get("/bookings", auth(["customer"]), getBookings);
router.post("/bookings", auth(["customer"]), createBooking);
router.put("/bookings/:id", auth(["customer"]), updateBooking);
router.delete("/bookings/:id", auth(["customer"]), deleteBooking);

module.exports = router;
