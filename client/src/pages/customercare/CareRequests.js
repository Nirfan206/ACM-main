import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

function CareRequests() {
  const [requests, setRequests] = useState([]); // Callback requests
  const [bookings, setBookings] = useState([]); // Booking requests
  const [employees, setEmployees] = useState([]); // List of employees for assignment
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // For Callback Requests
  const [selectedCallbackRequest, setSelectedCallbackRequest] = useState(null);
  const [callbackNotes, setCallbackNotes] = useState("");
  const [callbackStatusUpdate, setCallbackStatusUpdate] = useState("");

  // For Booking Requests
  const [selectedBookingRequest, setSelectedBookingRequest] = useState(null);
  const [bookingStatusUpdate, setBookingStatusUpdate] = useState("");
  const [bookingNotes, setBookingNotes] = useState("");
  const [assignEmployeeId, setAssignEmployeeId] = useState("");

  useEffect(() => {
    fetchData(); // Initial fetch

    const intervalId = setInterval(fetchData, 5000); // Poll every 5 seconds

    return () => clearInterval(intervalId); // Clean up interval on component unmount
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('token'); // Changed from localStorage
      if (!token) {
        setError("Authentication required. Please log in.");
        setLoading(false);
        return;
      }
      
      // Fetch CallbackRequest models
      const callbackResponse = await axios.get("http://localhost:5000/api/customercare/callback-requests", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRequests(callbackResponse.data);

      // Fetch BookingRequest models
      const bookingResponse = await axios.get("http://localhost:5000/api/customercare/requests", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(bookingResponse.data);

      // Fetch Employees for assignment
      const employeesResponse = await axios.get("http://localhost:5000/api/admin/users", { // Admin route to get all users, then filter
        headers: { Authorization: `Bearer ${token}` }
      });
      setEmployees(employeesResponse.data.filter(user => user.role === 'employee'));

      setError("");
    } catch (err) {
      console.error("Error fetching requests:", err);
      setError("Failed to load requests. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCallbackStatusUpdate = async () => {
    if (!selectedCallbackRequest || !callbackStatusUpdate) {
      setError("Please select a callback request and a status to update.");
      setTimeout(() => setError(""), 3000);
      return;
    }

    try {
      const token = sessionStorage.getItem('token'); // Changed from localStorage
      await axios.put(`http://localhost:5000/api/callback-requests/${selectedCallbackRequest._id}`, {
        status: callbackStatusUpdate,
        notes: callbackNotes.trim(),
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData(); // Re-fetch to update the list
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
  };

  const handleBookingStatusUpdate = async () => {
    if (!selectedBookingRequest || !bookingStatusUpdate) {
      setError("Please select a booking request and a status to update.");
      setTimeout(() => setError(""), 3000);
      return;
    }

    try {
      const token = sessionStorage.getItem('token'); // Changed from localStorage
      await axios.put(`http://localhost:5000/api/customercare/bookings/${selectedBookingRequest._id}/status`, {
        status: bookingStatusUpdate,
        notes: bookingNotes.trim(),
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData(); // Re-fetch to update the list
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
  };

  const handleAssignEmployee = async () => {
    if (!selectedBookingRequest || !assignEmployeeId) {
      setError("Please select a booking and an employee to assign.");
      setTimeout(() => setError(""), 3000);
      return;
    }

    try {
      const token = sessionStorage.getItem('token'); // Changed from localStorage
      await axios.put(`http://localhost:5000/api/customercare/bookings/${selectedBookingRequest._id}/assign-employee`, {
        employeeId: assignEmployeeId,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData(); // Re-fetch to update the list
      setSelectedBookingRequest(null);
      setAssignEmployeeId("");
      setSuccess("Employee assigned successfully ✅");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Error assigning employee:", err);
      setError(err.response?.data?.message || "Failed to assign employee. Please try again.");
      setTimeout(() => setError(""), 3000);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="admin-page-container">
      <h2 className="page-title">Customer Care Requests</h2>

      {error && (
        <div className="status-message error">
          {error}
        </div>
      )}
      {success && (
        <div className="status-message success">
          {success}
        </div>
      )}

      <div className="grid-container" style={{ gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Callback Requests */}
        <div>
          <h3 style={{ marginBottom: "15px", color: 'var(--color-text)' }}>Callback Requests</h3>
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
                        <span className={`status-badge status-${request.status.replace('_', '-')}`}>
                          {request.status.replace('_', ' ')}
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
          <h3 style={{ marginBottom: "15px", color: 'var(--color-text)' }}>Booking Requests</h3>
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
                        {booking.user?.profile?.name || 'N/A'}
                        <br />
                        <a href={`tel:${booking.user?.phone}`} className="text-secondary">
                          {booking.user?.phone || 'N/A'}
                        </a>
                        <br />
                        <small>{booking.user?.profile?.address || 'N/A'}</small>
                      </td>
                      <td>{booking.service?.type || 'N/A'}</td>
                      <td>{formatDate(booking.date)}</td>
                      <td>
                        <span className={`status-badge status-${booking.status.toLowerCase().replace(' ', '-').replace('awaiting-admin-confirmation', 'pending')}`}>
                          {booking.status.replace(' - ', ' ').replace('awaiting admin confirmation', 'Awaiting Admin')}
                        </span>
                      </td>
                      <td>{booking.employee?.profile?.name || 'Not Assigned'}</td>
                      <td>
                        <button
                          onClick={() => {
                            setSelectedBookingRequest(booking);
                            setBookingStatusUpdate(booking.status === 'Completed - Awaiting Admin Confirmation' ? 'Completed' : booking.status); // Map new status back to 'Completed' for dropdown
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

      {/* Callback Request Details Modal */}
      {selectedCallbackRequest && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title">Callback Request Details</h3>
            <div className="form-group">
              <p><strong>Name:</strong> {selectedCallbackRequest.name}</p>
              <p><strong>Phone:</strong> {selectedCallbackRequest.phone}</p>
              <p><strong>Message:</strong> {selectedCallbackRequest.message || "No message provided"}</p>
              <p><strong>Status:</strong> {selectedCallbackRequest.status.replace('_', ' ')}</p>
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
              <button
                onClick={() => setSelectedCallbackRequest(null)}
                className="btn btn-outline"
              >
                Close
              </button>
              <button
                onClick={handleCallbackStatusUpdate}
                disabled={!callbackStatusUpdate || (callbackStatusUpdate === selectedCallbackRequest.status && callbackNotes === (selectedCallbackRequest.notes || ""))}
                className="btn btn-primary"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Booking Request Details Modal */}
      {selectedBookingRequest && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title">Booking Request Management</h3>
            <div className="form-group">
              <p><strong>Customer:</strong> {selectedBookingRequest.user?.profile?.name || 'N/A'}</p>
              <p><strong>Phone:</strong> {selectedBookingRequest.user?.phone || 'N/A'}</p>
              <p><strong>Address:</strong> {selectedBookingRequest.user?.profile?.address || 'N/A'}</p>
              <p><strong>Service:</strong> {selectedBookingRequest.service?.type || 'N/A'}</p>
              <p><strong>Date:</strong> {formatDate(selectedBookingRequest.date)}</p>
              <p><strong>Current Status:</strong> {selectedBookingRequest.status.replace(' - ', ' ').replace('awaiting admin confirmation', 'Awaiting Admin')}</p>
              <p><strong>Assigned Employee:</strong> {selectedBookingRequest.employee?.profile?.name || 'Not Assigned'}</p>
              <p><strong>Notes:</strong> {selectedBookingRequest.notes || 'N/A'}</p>
            </div>

            <div className="form-group">
              <label>Assign Employee:</label>
              <select
                value={assignEmployeeId}
                onChange={(e) => setAssignEmployeeId(e.target.value)}
                className="form-control"
              >
                <option value="">Select Employee</option>
                {employees.map(emp => (
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
                <option value="Completed">Completed</option> {/* Customer Care sees 'Completed' */}
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
              <button
                onClick={() => setSelectedBookingRequest(null)}
                className="btn btn-outline"
              >
                Close
              </button>
              <button
                onClick={handleBookingStatusUpdate}
                disabled={!bookingStatusUpdate || (bookingStatusUpdate === selectedBookingRequest.status && bookingNotes === (selectedBookingRequest.notes || ""))}
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