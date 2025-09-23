import React, { useEffect, useState } from "react";
import api from "../../api";
import { useNavigate } from "react-router-dom";

function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [assignEmployeeId, setAssignEmployeeId] = useState("");
  const [bookingStatusUpdate, setBookingStatusUpdate] = useState("");
  const [bookingNotes, setBookingNotes] = useState("");

  const navigate = useNavigate();

  const allowedStatuses = [
    "Pending",
    "In Progress",
    "Completed",
    "Cancelled",
    "Pending - Weather",
    "Pending - Customer Unavailable",
    "Pending - Technical",
    "Completed - Awaiting Admin Confirmation"
  ];

  const fetchBookingsAndEmployees = async () => {
    try {
      setLoading(true);
      setError("");

      const token = sessionStorage.getItem("token");
      if (!token) {
        navigate("/login", { replace: true });
        return;
      }
      const headers = { Authorization: `Bearer ${token}` };

      const [bookingsRes, employeesRes] = await Promise.all([
        api.get("/api/admin/bookings", { headers }),
        api.get("/api/admin/users", { headers })
      ]);

      setBookings(bookingsRes.data || []);
      setEmployees((employeesRes.data || []).filter((u) => u.role === "employee"));
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err.response?.data?.message || "Failed to load bookings or employees.");
      const s = err.response?.status;
      if (s === 401 || s === 403) {
        navigate("/login", { replace: true });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch only; removed 5s polling
    fetchBookingsAndEmployees();
  }, [navigate]);

  const openManageModal = (booking) => {
    setSelectedBooking(booking);
    setAssignEmployeeId(booking.employee?._id || "");
    setBookingStatusUpdate(booking.status || "");
    setBookingNotes(booking.notes || "");
    setShowModal(true);
  };

  const handleAssignEmployee = async () => {
    if (!selectedBooking || !assignEmployeeId) {
      setError("Please select a booking and an employee to assign.");
      setTimeout(() => setError(""), 3000);
      return;
    }
    try {
      const token = sessionStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      await api.put(
        `/api/admin/bookings/${selectedBooking._id}/assign-employee`,
        { employeeId: assignEmployeeId },
        { headers }
      );

      // Optimistic update booking row
      const assignedEmp = employees.find((e) => e._id === assignEmployeeId) || null;
      setBookings((prev) =>
        prev.map((b) =>
          b._id === selectedBooking._id ? { ...b, employee: assignedEmp } : b
        )
      );

      setSuccess("Employee assigned successfully!");
      setShowModal(false);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Error assigning employee:", err);
      setError(err.response?.data?.message || "Failed to assign employee.");
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleUpdateBookingStatus = async () => {
    if (!selectedBooking || !bookingStatusUpdate) {
      setError("Please select a booking and a status to update.");
      setTimeout(() => setError(""), 3000);
      return;
    }
    try {
      const token = sessionStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      await api.put(
        `/api/admin/bookings/${selectedBooking._id}/status`,
        { status: bookingStatusUpdate, notes: bookingNotes.trim() },
        { headers }
      );

      // Optimistic update booking row
      setBookings((prev) =>
        prev.map((b) =>
          b._id === selectedBooking._id
            ? { ...b, status: bookingStatusUpdate, notes: bookingNotes.trim() }
            : b
        )
      );

      setSuccess("Booking status updated successfully!");
      setShowModal(false);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Error updating booking status:", err);
      setError(err.response?.data?.message || "Failed to update booking status.");
      setTimeout(() => setError(""), 3000);
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
        <p>Loading bookings...</p>
      </div>
    );
  }

  return (
    <div className="admin-page-container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 className="card-title">📅 Manage Bookings</h3>
        <button onClick={fetchBookingsAndEmployees} className="btn btn-outline">Refresh</button>
      </div>

      {success && <div className="status-message success">{success}</div>}
      {error && <div className="status-message error">{error}</div>}

      <div>
        {bookings.length === 0 ? (
          <p className="text-center text-light">No bookings found.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Customer</th>
                <th>Service</th>
                <th>Date & Time</th>
                <th>Status</th>
                <th>Assigned Employee</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking._id}>
                  <td>{booking._id.substring(0, 8)}</td>
                  <td>
                    {booking.user?.profile?.name || "N/A"}
                    <br />
                    <a href={`tel:${booking.user?.phone}`} className="text-secondary">
                      {booking.user?.phone || "N/A"}
                    </a>
                    <br />
                    <small>{booking.user?.profile?.address || "N/A"}</small>
                  </td>
                  <td>{booking.service?.type || "N/A"}</td>
                  <td>
                    {formatDate(booking.date)} at {booking.time}
                  </td>
                  <td>
                    <span
                      className={`status-badge ${booking.status
                        .toLowerCase()
                        .replace(" ", "-")
                        .replace("awaiting-admin-confirmation", "pending")}`}
                    >
                      {booking.status
                        .replace(" - ", " ")
                        .replace("awaiting admin confirmation", "Awaiting Admin")}
                    </span>
                  </td>
                  <td>{booking.employee?.profile?.name || "Not Assigned"}</td>
                  <td>
                    <button
                      onClick={() => openManageModal(booking)}
                      className="btn btn-secondary btn-sm"
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && selectedBooking && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title">
              Manage Booking: {selectedBooking._id.substring(0, 8)}
            </h3>

            <div className="form-group">
              <p>
                <strong>Customer:</strong> {selectedBooking.user?.profile?.name || "N/A"}
              </p>
              <p>
                <strong>Phone:</strong> {selectedBooking.user?.phone || "N/A"}
              </p>
              <p>
                <strong>Address:</strong> {selectedBooking.user?.profile?.address || "N/A"}
              </p>
              <p>
                <strong>Service:</strong> {selectedBooking.service?.type || "N/A"}
              </p>
              <p>
                <strong>Date & Time:</strong> {formatDate(selectedBooking.date)} at{" "}
                {selectedBooking.time}
              </p>
              <p>
                <strong>Current Status:</strong>{" "}
                {selectedBooking.status
                  .replace(" - ", " ")
                  .replace("awaiting admin confirmation", "Awaiting Admin")}
              </p>
              <p>
                <strong>Assigned Employee:</strong>{" "}
                {selectedBooking.employee?.profile?.name || "Not Assigned"}
              </p>
              <p>
                <strong>Notes:</strong> {selectedBooking.notes || "N/A"}
              </p>
            </div>

            <div className="form-group">
              <label>Assign Employee:</label>
              <select
                value={assignEmployeeId}
                onChange={(e) => setAssignEmployeeId(e.target.value)}
                className="form-control"
              >
                <option value="">Select Employee</option>
                {employees.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.profile?.name || emp.phone}
                  </option>
                ))}
              </select>
              <button
                onClick={handleAssignEmployee}
                disabled={
                  !assignEmployeeId || assignEmployeeId === selectedBooking.employee?._id
                }
                className="btn btn-accent btn-sm mt-2"
              >
                Assign
              </button>
            </div>

            <div className="form-group">
              <label>Update Status:</label>
              <select
                value={bookingStatusUpdate}
                onChange={(e) => setBookingStatusUpdate(e.target.value)}
                className="form-control"
              >
                <option value="">Select Status</option>
                {allowedStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status
                      .replace(" - ", " ")
                      .replace("awaiting admin confirmation", "Awaiting Admin")}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Add Notes:</label>
              <textarea
                value={bookingNotes}
                onChange={(e) => setBookingNotes(e.target.value)}
                className="form-control"
                rows="3"
                placeholder="Add notes for status update (e.g., reason for cancellation, delay)"
              />
            </div>

            <div className="modal-actions">
              <button onClick={() => setShowModal(false)} className="btn btn-outline">
                Close
              </button>
              <button
                onClick={handleUpdateBookingStatus}
                disabled={
                  !bookingStatusUpdate ||
                  (bookingStatusUpdate === selectedBooking.status &&
                    bookingNotes === (selectedBooking.notes || ""))
                }
                className="btn btn-primary"
              >
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminBookings;
