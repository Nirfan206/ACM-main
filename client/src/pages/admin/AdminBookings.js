import React, { useState, useEffect, useRef } from 'react';
import api from '../../api';// This import is correct
import { useNavigate } from 'react-router-dom';

function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [assignEmployeeId, setAssignEmployeeId] = useState('');
  const [bookingStatusUpdate, setBookingStatusUpdate] = useState('');
  const [bookingNotes, setBookingNotes] = useState('');

  const navigate = useNavigate();

  const allowedStatuses = [
    'Pending', 
    'In Progress', 
    'Completed', 
    'Cancelled',
    'Pending - Weather', 
    'Pending - Customer Unavailable', 
    'Pending - Technical',
    'Completed - Awaiting Admin Confirmation'
  ];

  useEffect(() => {
    fetchBookingsAndEmployees(); // Initial fetch

    const intervalId = setInterval(fetchBookingsAndEmployees, 5000); // Poll every 5 seconds

    return () => clearInterval(intervalId); // Clean up interval on component unmount
  }, [navigate]);

  const fetchBookingsAndEmployees = async () => {
    try {
      setLoading(true);
      setError('');
      const token = sessionStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      // Fetch all bookings
      const bookingsResponse = await api.get('/api/admin/bookings', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookings(bookingsResponse.data);

      // Fetch all employees
      const employeesResponse = await api.get('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEmployees(employeesResponse.data.filter(user => user.role === 'employee'));

    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.response?.data?.message || 'Failed to load bookings or employees.');
      if (err.response?.status === 401 || err.response?.status === 403) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const openManageModal = (booking) => {
    setSelectedBooking(booking);
    setAssignEmployeeId(booking.employee?._id || '');
    setBookingStatusUpdate(booking.status);
    setBookingNotes(booking.notes || '');
    setShowModal(true);
  };

  const handleAssignEmployee = async () => {
    if (!selectedBooking || !assignEmployeeId) {
      setError('Please select a booking and an employee to assign.');
      setTimeout(() => setError(''), 3000);
      return;
    }

    try {
      const token = sessionStorage.getItem('token');
      await api.put(`/api/admin/bookings/${selectedBooking._id}/assign-employee`, {
        employeeId: assignEmployeeId,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('Employee assigned successfully!');
      setShowModal(false);
      fetchBookingsAndEmployees(); // Re-fetch immediately after action
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error assigning employee:', err);
      setError(err.response?.data?.message || 'Failed to assign employee.');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleUpdateBookingStatus = async () => {
    if (!selectedBooking || !bookingStatusUpdate) {
      setError('Please select a booking and a status to update.');
      setTimeout(() => setError(''), 3000);
      return;
    }
    
    try {
      const token = sessionStorage.getItem('token');
      await api.put(`/api/admin/bookings/${selectedBooking._id}/status`, {
        status: bookingStatusUpdate,
        notes: bookingNotes.trim(),
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('Booking status updated successfully!');
      setShowModal(false);
      fetchBookingsAndEmployees(); // Re-fetch immediately after action
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error updating booking status:', err);
      setError(err.response?.data?.message || 'Failed to update booking status.');
      setTimeout(() => setError(''), 3000);
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

  if (loading) {
    return (
      <div className="text-center p-8">
        <p>Loading bookings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 status-message error">
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="admin-page-container">
      <h3 className="card-title text-center">📅 Manage Bookings</h3>

      {success && <div className="status-message success">{success}</div>}
      {error && <div className="status-message error">{error}</div>}

      {/* Bookings Table */}
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
                    {booking.user?.profile?.name || 'N/A'}
                    <br />
                    <a href={`tel:${booking.user?.phone}`} className="text-secondary">
                      {booking.user?.phone || 'N/A'}
                    </a>
                    <br />
                    <small>{booking.user?.profile?.address || 'N/A'}</small>
                  </td>
                  <td>{booking.service?.type || 'N/A'}</td>
                  <td>{formatDate(booking.date)} at {booking.time}</td>
                  <td>
                    <span className={`status-badge status-${booking.status.toLowerCase().replace(' ', '-').replace('awaiting-admin-confirmation', 'pending')}`}>
                      {booking.status.replace(' - ', ' ').replace('awaiting admin confirmation', 'Awaiting Admin')}
                    </span>
                  </td>
                  <td>{booking.employee?.profile?.name || 'Not Assigned'}</td>
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

      {/* Booking Management Modal */}
      {showModal && selectedBooking && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title">Manage Booking: {selectedBooking._id.substring(0, 8)}</h3>
            <div className="form-group">
              <p><strong>Customer:</strong> {selectedBooking.user?.profile?.name || 'N/A'}</p>
              <p><strong>Phone:</strong> {selectedBooking.user?.phone || 'N/A'}</p>
              <p><strong>Address:</strong> {selectedBooking.user?.profile?.address || 'N/A'}</p>
              <p><strong>Service:</strong> {selectedBooking.service?.type || 'N/A'}</p>
              <p><strong>Date & Time:</strong> {formatDate(selectedBooking.date)} at {selectedBooking.time}</p>
              <p><strong>Current Status:</strong> {selectedBooking.status.replace(' - ', ' ').replace('awaiting admin confirmation', 'Awaiting Admin')}</p>
              <p><strong>Assigned Employee:</strong> {selectedBooking.employee?.profile?.name || 'Not Assigned'}</p>
              <p><strong>Notes:</strong> {selectedBooking.notes || 'N/A'}</p>
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
                disabled={!assignEmployeeId || assignEmployeeId === selectedBooking.employee?._id}
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
                {allowedStatuses.map(status => (
                  <option key={status} value={status}>{status.replace(' - ', ' ').replace('awaiting admin confirmation', 'Awaiting Admin')}</option>
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
              <button
                onClick={() => setShowModal(false)}
                className="btn btn-outline"
              >
                Close
              </button>
              <button
                onClick={handleUpdateBookingStatus}
                disabled={
                  !bookingStatusUpdate || 
                  (bookingStatusUpdate === selectedBooking.status && bookingNotes === (selectedBooking.notes || ""))
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
