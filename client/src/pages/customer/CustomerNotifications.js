import React, { useEffect, useState } from "react";
import api from "../../api";
import { useNavigate } from "react-router-dom";
import { logout } from "../../utils/authUtils";

function CustomerNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = sessionStorage.getItem("token");
      if (!token) {
        logout();
        navigate("/login", { replace: true });
        return;
      }

      const res = await api.get("/api/customer/notifications", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(res.data || []);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setError(
        err.response?.data?.message || "Failed to load notifications. Please try again later."
      );
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
    // Initial load only; removed 10s polling
    fetchNotifications();
  }, [navigate]);

  const markAsRead = async (notificationId) => {
    try {
      const token = sessionStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      await api.put(`/api/customer/notifications/${notificationId}/read`, {}, { headers });

      // Optimistic local update
      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error("Error marking notification as read:", err);
      setError(err.response?.data?.message || "Failed to mark notification as read.");
    }
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });

  if (loading) {
    return (
      <div className="text-center p-8">
        <p>Loading notifications...</p>
      </div>
    );
  }

  return (
    <div className="card profile-container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 className="card-title text-center">🔔 My Notifications</h3>
        <button onClick={fetchNotifications} className="btn btn-outline">Refresh</button>
      </div>

      {error && <div className="status-message error">{error}</div>}

      {notifications.length === 0 ? (
        <p className="text-center text-light">No notifications found.</p>
      ) : (
        <div className="notifications-list">
          {notifications.map((notification) => (
            <div
              key={notification._id}
              className={`notification-item ${notification.read ? "read" : "unread"}`}
              style={{
                padding: "15px",
                marginBottom: "10px",
                borderRadius: "8px",
                border: `1px solid ${
                  notification.read ? "var(--border)" : "var(--color-primary)"
                }`,
                backgroundColor: notification.read
                  ? "var(--color-light)"
                  : "rgba(var(--color-primary-rgb), 0.05)",
                boxShadow: "var(--shadow)",
                display: "flex",
                flexDirection: "column",
                gap: "5px"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <strong
                  style={{ color: notification.read ? "var(--color-text)" : "var(--color-dark)" }}
                >
                  {notification.type === "message" ? "Message from Customer Care" : "System Notification"}
                </strong>
                <span style={{ fontSize: "0.8rem", color: "var(--color-textLight)" }}>
                  {formatDate(notification.createdAt)}
                </span>
              </div>
              <p style={{ margin: 0, color: "var(--color-text)" }}>{notification.message}</p>
              {notification.booking && (
                <small style={{ color: "var(--color-textLight)" }}>
                  Related to Booking: {notification.booking.service?.type || "N/A Service"} on{" "}
                  {formatDate(notification.booking.date)}
                </small>
              )}
              {!notification.read && (
                <button
                  onClick={() => markAsRead(notification._id)}
                  className="btn btn-sm btn-secondary"
                  style={{ alignSelf: "flex-end", marginTop: "10px" }}
                >
                  Mark as Read
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CustomerNotifications;
