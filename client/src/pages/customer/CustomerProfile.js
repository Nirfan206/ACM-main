// client/src/pages/CustomerProfile.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { logout } from '../../utils/authUtils'; // Import logout utility

function CustomerProfile() {
  const [profile, setProfile] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    preferences: {}
  });
  const [serviceHistory, setServiceHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const navigate = useNavigate();

  // Function to fetch the profile data and service history
  const fetchProfile = async () => {
    try {
      const token = sessionStorage.getItem("token"); // Changed from localStorage
      if (!token) {
        logout(); // Use utility for logout
        navigate("/login");
        return;
      }
      setLoading(true);
      
      // Fetch profile data
      const profileRes = await axios.get("http://localhost:5000/api/customer/profile", {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Map the data from the User model structure
      const userData = profileRes.data;
      setProfile({
        name: userData.profile?.name || "",
        phone: userData.phone || "",
        email: userData.profile?.email || "",
        address: userData.profile?.address || ""
      });
      
      // Fetch service history, ensuring service details are populated
      const bookingsRes = await axios.get("http://localhost:5000/api/customer/bookings", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setServiceHistory(bookingsRes.data);
    } catch (err) {
      console.error("❌ Failed to fetch profile or service history:", err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        logout();
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [navigate]);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = sessionStorage.getItem("token"); // Changed from localStorage
      
      // Format the data according to the User model structure
      const profileData = {
        profile: {
          name: profile.name,
          email: profile.email,
          address: profile.address
        },
        phone: profile.phone
      };
      
      await axios.put(
        "http://localhost:5000/api/customer/profile",
        profileData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditMode(false);
      // Re-fetch the data after a successful save to ensure the UI is in sync
      await fetchProfile();
      
      // Show success message or notification
      alert("Profile updated successfully!");
    } catch (err) {
      console.error("❌ Failed to save profile:", err);
      alert("Failed to update profile. Please try again.");
      if (err.response?.status === 401 || err.response?.status === 403) {
        logout();
        navigate('/login');
      }
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({ ...passwordData, [name]: value });
    // Clear any previous error/success messages when user starts typing
    setPasswordError("");
    setPasswordSuccess("");
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    
    // Validate passwords match
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }
    
    // Validate password length
    if (passwordData.newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters");
      return;
    }
    
    try {
      const token = sessionStorage.getItem("token"); // Changed from localStorage
      await axios.put(
        "http://localhost:5000/api/customer/password",
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Reset form and show success message
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
      setPasswordSuccess("Password updated successfully");
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setPasswordSuccess("");
      }, 3000);
      
    } catch (error) {
      console.error("Error updating password:", error);
      setPasswordError(error.response?.data?.message || "Failed to update password");
      if (error.response?.status === 401 || error.response?.status === 403) {
        logout();
        navigate('/login');
      }
    }
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      logout(); // Use utility for logout
      navigate("/login");
    }
  };

  if (loading) return <p className="text-center">Loading profile...</p>;

  return (
    <div className="card profile-container" style={{ maxWidth: 800, margin: "2rem auto" }}>
      <h3 style={{ textAlign: "center", marginBottom: "1.5rem", color: 'var(--color-text)' }}>👤 My Profile</h3>

      <form onSubmit={handleSave}>
        <div className="form-group">
          <label>Name:</label>
          <input
            type="text"
            name="name"
            value={profile.name}
            onChange={handleChange}
            readOnly={!editMode}
            className="form-control"
          />
        </div>

        <div className="form-group">
          <label>Phone:</label>
          <input
                type="text"
                name="phone"
                value={profile.phone || ""}
                onChange={handleChange}
                disabled={true} // Phone number should not be editable
                className="form-control"
              />
        </div>

        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={profile.email}
            onChange={handleChange}
            readOnly={!editMode}
            className="form-control"
          />
        </div>

        <div className="form-group">
          <label>Address:</label>
          <textarea
            name="address"
            value={profile.address}
            onChange={handleChange}
            readOnly={!editMode}
            className="form-control"
          />
        </div>

        <div className="form-actions">
          <div>
            <button
              type="button"
              className="btn btn-danger"
              onClick={handleLogout}
            >
              Logout
            </button>
            <button
              type="button"
              className="btn btn-warning"
              onClick={() => setShowPasswordReset(!showPasswordReset)}
            >
              {showPasswordReset ? "Hide Password Reset" : "Reset Password"}
            </button>
          </div>

          {editMode ? (
            <div className="form-actions-group">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setEditMode(false)}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setEditMode(true)}
            >
              Edit Profile
            </button>
          )}
        </div>
      </form>

      {/* Password Reset Form */}
      {showPasswordReset && (
        <div className="password-reset-section">
          <h4 style={{ textAlign: "center", marginBottom: "1rem" }}>Reset Password</h4>
          
          {passwordError && (
            <div className="status-message error">
              {passwordError}
            </div>
          )}
          
          {passwordSuccess && (
            <div className="status-message success">
              {passwordSuccess}
            </div>
          )}
          
          <form onSubmit={handlePasswordReset}>
            <div className="form-group">
              <label>Current Password:</label>
              <input
                type="password"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                required
                className="form-control"
              />
            </div>
            
            <div className="form-group">
              <label>New Password:</label>
              <input
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                required
                className="form-control"
              />
            </div>
            
            <div className="form-group">
              <label>Confirm New Password:</label>
              <input
                type="password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                required
                className="form-control"
              />
            </div>
            
            <div style={{ textAlign: "center", marginTop: "1rem" }}>
              <button type="submit" className="btn btn-primary">
                Update Password
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Service History Section */}
      <div className="service-history-section">
        <h4 style={{ textAlign: "center", marginBottom: "1rem" }}>Service History</h4>
        
        {serviceHistory.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Service</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {serviceHistory.map((service) => (
                <tr key={service._id}>
                  <td>{service.service?.type || 'N/A'}</td>
                  <td>{new Date(service.date).toLocaleDateString()}</td>
                  <td>
                    <span className={`status-badge status-${service.status.toLowerCase().replace(' ', '-')}`}>
                      {service.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ textAlign: "center", padding: "1rem", background: "var(--background-light)", borderRadius: "4px" }}>
            No service history found. Book a service to see your history here.
          </p>
        )}
      </div>
    </div>
  );
}

export default CustomerProfile;