import React, { useEffect, useState } from "react";
import api from "../../api";

function CareMessaging() {
  const [messages, setMessages] = useState([]); // local session messages
  const [input, setInput] = useState("");
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Quick default messages
  const defaultMessages = [
    "Your booking has been confirmed.",
    "An employee has been assigned to your service.",
    "Your service is now in progress.",
    "Your service has been completed.",
    "We are experiencing a slight delay with your service. We will update you shortly.",
    "Our technician is on the way.",
    "Your booking has been cancelled. Please contact support for details."
  ];

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError("");

      const token = sessionStorage.getItem("token");
      if (!token) {
        setError("Authentication required. Please log in.");
        return;
      }

      // Fetch bookings to message about
      const res = await api.get("/api/customercare/requests", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(res.data || []);
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setError("Failed to load bookings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch only; no timers or auto reloads
    fetchBookings();
  }, []);

  const handleSend = async (e) => {
    e.preventDefault(); // prevent form causing a page refresh
    if (input.trim() === "" || !selectedBooking) {
      setError("Please select a booking and enter a message");
      setTimeout(() => setError(""), 3000);
      return;
    }

    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        setError("Authentication required. Please log in.");
        return;
      }

      await api.post(
        "/api/customercare/notify",
        { bookingId: selectedBooking, message: input.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessages((prev) => [
        ...prev,
        { text: input.trim(), time: new Date().toLocaleTimeString() }
      ]);
      setInput("");
      setSuccess("Message sent successfully ✅");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Error sending message:", err);
      setError(err.response?.data?.message || "Failed to send message. Please try again.");
      setTimeout(() => setError(""), 3000);
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ color: "var(--color-dark)" }}>Messaging & Notifications</h3>
        <button onClick={fetchBookings} className="btn btn-outline">Refresh</button>
      </div>
      <p>Send updates and notifications to customers regarding service progress.</p>

      {error && (
        <div
          style={{
            padding: "10px",
            backgroundColor: `rgba(var(--color-error-rgb), 0.1)`,
            color: "var(--color-error)",
            borderRadius: "5px",
            marginBottom: "15px"
          }}
        >
          {error}
        </div>
      )}
      {success && (
        <div
          style={{
            padding: "10px",
            backgroundColor: `rgba(var(--color-success-rgb), 0.1)`,
            color: "var(--color-success)",
            borderRadius: "5px",
            marginBottom: "15px"
          }}
        >
          {success}
        </div>
      )}

      <div style={{ marginBottom: "15px" }}>
        <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
          Select Booking:
        </label>
        <select
          value={selectedBooking}
          onChange={(e) => setSelectedBooking(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "5px",
            border: `1px solid rgba(var(--color-textLight-rgb), 0.3)`,
            marginBottom: "15px"
          }}
        >
          <option value="">Select a booking</option>
          {bookings.length === 0 ? (
            <option disabled>No active bookings to message about.</option>
          ) : (
            bookings.map((booking) => (
              <option key={booking._id} value={booking._id}>
                {booking.service?.type || "Unknown Service"} -{" "}
                {booking.user?.profile?.name || "Unknown Customer"} (Status: {booking.status})
              </option>
            ))
          )}
        </select>
      </div>

      <div style={{ marginBottom: "15px" }}>
        <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
          Quick Messages:
        </label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {defaultMessages.map((msg, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setInput(msg)}
              style={{
                padding: "8px 12px",
                backgroundColor: "var(--color-secondary)",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                fontSize: "0.9rem",
                transition: "background-color 0.3s ease"
              }}
            >
              {msg}
            </button>
          ))}
        </div>
      </div>

      <div
        style={{
          border: "1px solid #ccc",
          borderRadius: "5px",
          padding: "10px",
          height: "200px",
          overflowY: "auto",
          backgroundColor: "var(--color-light)",
          marginBottom: "10px"
        }}
      >
        {loading ? (
          <p style={{ color: "var(--color-secondary)", fontWeight: "bold" }}>⏳ Loading messages...</p>
        ) : messages.length === 0 ? (
          <p style={{ color: "var(--color-textLight)" }}>No messages sent yet for this session.</p>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              style={{
                backgroundColor: `rgba(var(--color-secondary-rgb), 0.15)`,
                padding: "8px",
                borderRadius: "5px",
                marginBottom: "8px"
              }}
            >
              <p style={{ margin: 0 }}>{msg.text}</p>
              <small style={{ fontSize: "12px", color: "var(--color-textLight)" }}>{msg.time}</small>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSend} style={{ display: "flex", gap: "10px" }}>
        <input
          type="text"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{
            flex: 1,
            padding: "10px",
            border: `1px solid rgba(var(--color-textLight-rgb), 0.3)`,
            borderRadius: "5px"
          }}
        />
        <button
          type="submit"
          style={{
            padding: "10px 20px",
            backgroundColor: "var(--color-primary)",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer"
          }}
        >
          Send
        </button>
      </form>
    </div>
  );
}

export default CareMessaging;
