import React, { useEffect, useState } from "react";
import api from "../../api";
import { useNavigate } from "react-router-dom";
import { logout } from "../../utils/authUtils";

function EmployeeProfile() {
  const [profile, setProfile] = useState({
    name: "",
    phone: "",
    email: "",
    address: ""
  });
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
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");

  const navigate = useNavigate();

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setProfileError("");

      const token = sessionStorage.getItem("token");
      if (!token) {
        logout();
        navigate("/login", { replace: true });
        return;
      }

      const profileRes = await api.get("/api/employee/profile", {
        headers: { Authorization: `Bearer ${token}` }
      });

      const userData = profileRes.data || {};
      setProfile({
        name: userData.profile?.name || "",
        phone: userData.phone || "",
        email: userData.profile?.email || "",
        address: userData.profile?.address || ""
      });
    } catch (err) {
      console.error("Failed to fetch Employee profile:", err);
      setProfileError(err.response?.data?.message || "Failed to load profile.");
      const s = err.response?.status;
      if (s === 401 || s === 403) {
        logout();
        navigate("/login", { replace: true });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch only; no timers or auto reloads
    fetchProfile();
    // navigate is stable in React Router v6; dependency included to appease lints
  }, [navigate]); // safe pattern: effect runs once unless navigate identity changes

  const handleChange = (e) => {
    setProfile((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setProfileError("");
    setProfileSuccess("");
    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        logout();
        navigate("/login", { replace: true });
        return;
      }

      const profileData = {
        profile: {
          name: profile.name,
          email: profile.email,
          address: profile.address
        },
        phone: profile.phone
      };

      await api.put("/api/employee/profile", profileData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setEditMode(false);
      await fetchProfile();
      setProfileSuccess("Profile updated successfully!");
      setTimeout(() => setProfileSuccess(""), 3000);
    } catch (err) {
      console.error("Failed to save Employee profile:", err);
      setProfileError(
        err.response?.data?.message || "Failed to update profile. Please try again."
      );
      const s = err.response?.status;
      if (s === 401 || s === 403) {
        logout();
        navigate("/login", { replace: true });
      }
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((d) => ({ ...d, [name]: value }));
    setPasswordError("");
    setPasswordSuccess("");
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters");
      return;
    }

    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        logout();
        navigate("/login", { replace: true });
        return;
      }

      await api.put(
        "/api/employee/password",
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
      setPasswordSuccess("Password updated successfully");
      setTimeout(() => setPasswordSuccess(""), 3000);
    } catch (error) {
      console.error("Error updating password:", error);
      setPasswordError(error.response?.data?.message || "Failed to update password");
      const s = error.response?.status;
      if (s === 401 || s === 403) {
        logout();
        navigate("/login", { replace: true });
      }
    }
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      logout();
      navigate("/login", { replace: true });
    }
  };

  if (loading) return <p className="text-center">Loading profile...</p>;

  return (
    <div className="card profile-container">
      <h3 className="card-title text-center">👤 My Profile (Employee)</h3>

      {profileError && <div className="status-message error">{profileError}</div>}
      {profileSuccess && <div className="status-message success">{profileSuccess}</div>}

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
            disabled={true}
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
            <button type="button" onClick={handleLogout} className="btn btn-danger">
              Logout
            </button>
            <button
              type="button"
              onClick={() => setShowPasswordReset((v) => !v)}
              className="btn btn-warning"
            >
              {showPasswordReset ? "Hide Password Reset" : "Reset Password"}
            </button>
          </div>

          {editMode ? (
            <div className="form-actions-group">
              <button
                type="button"
                onClick={() => {
                  setEditMode(false);
                  fetchProfile(); // refresh data without page reload
                }}
                disabled={saving}
                className="btn btn-outline"
              >
                Cancel
              </button>
              <button type="submit" disabled={saving} className="btn btn-primary">
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          ) : (
            <button type="button" onClick={() => setEditMode(true)} className="btn btn-primary">
              Edit Profile
            </button>
          )}
        </div>
      </form>

      {showPasswordReset && (
        <div className="password-reset-section">
          <h4 className="text-center">Reset Password</h4>

          {passwordError && <div className="status-message error">{passwordError}</div>}
          {passwordSuccess && <div className="status-message success">{passwordSuccess}</div>}

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

            <div className="text-center mt-4">
              <button type="submit" className="btn btn-primary">
                Update Password
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default EmployeeProfile;
