import React, { useEffect, useState } from "react";
import api from "../../api";

function CareRequests() {
  const [requests, setRequests] = useState([]);    // Callback requests
  const [bookings, setBookings] = useState([]);    // Booking requests
  const [employees, setEmployees] = useState([]);  // Employees for assignment
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Callback Requests state
  const [selectedCallbackRequest, setSelectedCallbackRequest] = useState(null);
  const [callbackNotes, setCallbackNotes] = useState("");
  const [callbackStatusUpdate, setCallbackStatusUpdate] = useState("");

  // Booking Requests state
  const [selectedBookingRequest, setSelectedBookingRequest] = useState(null);
  const [bookingStatusUpdate, setBookingStatusUpdate] = useState("");
  const [bookingNotes, setBookingNotes] = useState("");
  const [assignEmployeeId, setAssignEmployeeId] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const token = sessionStorage.getItem("token");
      if (!token) {
        setError("Authentication required. Please log in.");
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };

      const [callbackRes, bookingRes, employeesRes] = await Promise.all([
        api.get("/api/customercare/callback-requests", { headers }),
        api.get("/api/customercare/requests", { headers }),
        api.get("/api/admin/users", { headers })
      ]);

      setRequests(callbackRes.data || []);
      setBookings(bookingRes.data || []);
      setEmployees((employeesRes.data || []).filter((u) => u.role === "employee"));
    } catch (err) {
      console.error("Error fetching requests:", err);
      setError("Failed to load requests. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch only; removed 5s polling
    fetchData();
  }, []);

  const handleCallbackStatusUpdate = async () => {
    if (!selectedCallbackRequest || !callbackStatusUpdate) {
      setError("Please select a callback request and a status to update.");
    } else {
      try {
        const token = sessionStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        const body = {
          status: callbackStatusUpdate,
          notes: callbackNotes.trim()
        };

        await api.put(`/api/callback-requests/${selectedCallbackRequest._id}`, body, { headers });

        // Optimistic local update to avoid full refetch
        setRequests((prev) =>
          prev.map((r) =>
            r._id === selectedCallbackRequest._id
              ? { ...r, status: callbackStatusUpdate, notes: body.notes }
              : r
          )
        );

        setSelectedCallbackRequest(null);
        setCallbackNotes("");
        setCallbackStatusUpdate("");
        setSuccess("Callback request updated successfully ✅");
        setTimeout(() => setSuccess(""), 3000);
      } catch (err) {
        console.error("Error updating callback request status:", err);
        setError("Failed to update callback request status. Please try again.");
        setTimeout(() => setError(""), 3000);
      }
    }
  };

  const handleBookingStatusUpdate = async () => {
    if (!selectedBookingRequest || !bookingStatusUpdate) {
      setError("Please select a booking request and a status to update.");
    } else {
      try {
        const token = sessionStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        const body = {
          status: bookingStatusUpdate,
          notes: bookingNotes.trim()
        };

        await api.put(
          `/api/customercare/bookings/${selectedBookingRequest._id}/status`,
          body,
          { headers }
        );

        // Optimistic local update
        setBookings((prev) =>
          prev.map((b) =>
            b._id === selectedBookingRequest._id
              ? { ...b, status: bookingStatusUpdate, notes: body.notes }
              : b
          )
        );

        setSelectedBookingRequest(null);
        setBookingNotes("");
        setBookingStatusUpdate("");
        setSuccess("Booking status updated successfully ✅");
        setTimeout(() => setSuccess(""), 3000);
      } catch (err) {
        console.error("Error updating booking status:", err);
        setError("Failed to update booking status. Please try again.");
        setTimeout(() => setError(""), 3000);
      }
    }
  };

  const handleAssignEmployee = async () => {
    if (!selectedBookingRequest || !assignEmployeeId) {
      setError("Please select a booking and an employee to assign.");
    } else {
      try {
        const token = sessionStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        await api.put(
          `/api/customercare/bookings/${selectedBookingRequest._id}/assign-employee`,
          { employeeId: assignEmployeeId },
          { headers }
        );

        // Optimistic local update
        const assignedEmp = employees.find((e) => e._id === assignEmployeeId);
        setBookings((prev) =>
          prev.map((b) =>
            b._id === selectedBookingRequest._id
              ? { ...b, employee: assignedEmp ? { ...assignedEmp } : b.employee }
              : b
          )
        );

        setSelectedBookingRequest(null);
        setAssignEmployeeId("");
        setSuccess("Employee assigned successfully ✅");
        setTimeout(() => setSuccess(""), 3000);
      } catch (err) {
        console.error("Error assigning employee:", err);
        setError(err.response?.data?.message || "Failed to assign employee. Please try again.");
        setTimeout(() => setError(""), 3000);
      }
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

  return (
    <div className="admin-page-container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 className="page-title">Customer Care Requests</h2>
        <button onClick={fetchData} className="btn btn-outline">Refresh</button>
      </div>

      {error && <div className="status-message error">{error}</div>}
      {success && <div className="status-message success">{success}</div>}

      <div className="grid-container" style={{ gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        {/* Callback Requests */}
        <div>
          <h3 style={{ marginBottom: "15px", color: "var(--color-text)" }}>Callback Requests</h3>
          <div>
            {loading ? (
              <p className="text-center">⏳ Loading callback requests...</p>
            ) : requests.length === 0 ? (
              <p className="text-center">No callback requests found.</p>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Phone</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((request) => (
                    <tr key={request._id}>
                      <td>{request.name}</td>
                      <td>
                        <a href={`tel:${request.phone}`} className="text-secondary">
                          {request.phone}
                        </a>
                      </td>
                      <td>
                        <span className={`status-badge status-${request.status.replace("_", "-")}`}>
                          {request.status.replace("_", " ")}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => {
                            setSelectedCallbackRequest(request);
                            setCallbackStatusUpdate(request.status);
                            setCallbackNotes(request.notes || "");
                          }}
                          className="btn btn-secondary btn-sm"
                        >
                          View/Update
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Booking Requests */}
        <div>
          <h3 style={{ marginBottom: "15px", color: "var(--color-text)" }}>Booking Requests</h3>
          <div>
            {loading ? (
              <p className="text-center">⏳ Loading booking requests...</p>
            ) : bookings.length === 0 ? (
              <p className="text-center">No booking requests found.</p>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Service</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Employee</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr key={booking._id}>
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
                      <td>{formatDate(booking.date)}</td>
                      <td>
                        <span
                          className={`status-badge status-${booking.status
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
                          onClick={() => {
                            setSelectedBookingRequest(booking);
                            setBookingStatusUpdate(
                              booking.status === "Completed - Awaiting Admin Confirmation"
                                ? "Completed"
                                : booking.status
                            );
                            setBookingNotes(booking.notes || "");
                            setAssignEmployeeId(booking.employee?._id || "");
                          }}
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
        </div>
      </div>

      {/* Callback Request Modal */}
      {selectedCallbackRequest && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title">Callback Request Details</h3>
            <div className="form-group">
              <p><strong>Name:</strong> {selectedCallbackRequest.name}</p>
              <p><strong>Phone:</strong> {selectedCallbackRequest.phone}</p>
              <p><strong>Message:</strong> {selectedCallbackRequest.message || "No message provided"}</p>
              <p><strong>Status:</strong> {selectedCallbackRequest.status.replace("_", " ")}</p>
              <p><strong>Date Requested:</strong> {formatDate(selectedCallbackRequest.createdAt)}</p>
            </div>

            <div className="form-group">
              <label>Add Notes:</label>
              <textarea
                value={callbackNotes}
                onChange={(e) => setCallbackNotes(e.target.value)}
                className="form-control"
                rows="3"
              />
            </div>

            <div className="form-group">
              <label>Update Status:</label>
              <select
                value={callbackStatusUpdate}
                onChange={(e) => setCallbackStatusUpdate(e.target.value)}
                className="form-control"
              >
                <option value="">Select Status</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div className="modal-actions">
              <button onClick={() => setSelectedCallbackRequest(null)} className="btn btn-outline">
                Close
              </button>
              <button
                onClick={handleCallbackStatusUpdate}
                disabled={
                  !callbackStatusUpdate ||
                  (callbackStatusUpdate === selectedCallbackRequest.status &&
                    callbackNotes === (selectedCallbackRequest.notes || ""))
                }
                className="btn btn-primary"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Booking Request Modal */}
      {selectedBookingRequest && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title">Booking Request Management</h3>
            <div className="form-group">
              <p><strong>Customer:</strong> {selectedBookingRequest.user?.profile?.name || "N/A"}</p>
              <p><strong>Phone:</strong> {selectedBookingRequest.user?.phone || "N/A"}</p>
              <p><strong>Address:</strong> {selectedBookingRequest.user?.profile?.address || "N/A"}</p>
              <p><strong>Service:</strong> {selectedBookingRequest.service?.type || "N/A"}</p>
              <p><strong>Date:</strong> {formatDate(selectedBookingRequest.date)}</p>
              <p><strong>Current Status:</strong> {selectedBookingRequest.status
                .replace(" - ", " ")
                .replace("awaiting admin confirmation", "Awaiting Admin")}</p>
              <p><strong>Assigned Employee:</strong> {selectedBookingRequest.employee?.profile?.name || "Not Assigned"}</p>
              <p><strong>Notes:</strong> {selectedBookingRequest.notes || "N/A"}</p>
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
                disabled={!assignEmployeeId || assignEmployeeId === selectedBookingRequest.employee?._id}
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
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
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
              <button onClick={() => setSelectedBookingRequest(null)} className="btn btn-outline">
                Close
              </button>
              <button
                onClick={handleBookingStatusUpdate}
                disabled={
                  !bookingStatusUpdate ||
                  (bookingStatusUpdate === selectedBookingRequest.status &&
                    bookingNotes === (selectedBookingRequest.notes || ""))
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

export default CareRequests;
