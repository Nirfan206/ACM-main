import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../utils/authUtils'; // Import logout utility

function CustomerBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showNewBookingModal, setShowNewBookingModal] = useState(false);
  const [availableServices, setAvailableServices] = useState([]);
  const [customerProfile, setCustomerProfile] = useState(null);
  const [newBookingForm, setNewBookingForm] = useState({
    service: '',
    problem: '', // Stores selected problem from dropdown
    problemDescription: '', // Stores detailed problem if 'Other' is selected
    date: '',
    time: '',
    address: '',
  });
  const navigate = useNavigate();

  // Define common problems for each service category
  const serviceProblems = {
    'AC': [
      'AC not cooling', 'Water leakage from AC', 'AC making noise', 
      'AC not turning on', 'Bad odor from AC', 'AC gas refilling'
    ],
    'Fridge': [
      'Fridge not cooling', 'Water leakage from fridge', 'Fridge making noise',
      'Fridge not turning on', 'Excessive frosting', 'Door seal broken'
    ],
    'Washing Machine': [
      'Washing machine not draining', 'Washing machine not spinning', 'Washing machine making noise',
      'Washing machine not turning on', 'Water leakage from washing machine', 'Drum not rotating'
    ],
    'Electrical': [
      'Power outage in specific area', 'Faulty wiring', 'Socket repair/replacement',
      'Light fixture installation/repair', 'Circuit breaker tripping', 'Fan repair/installation'
    ],
    'Other': [] // For services not explicitly listed or general issues
  };

  // Fetch bookings, services, and customer profile
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = sessionStorage.getItem('token');
        if (!token) {
          logout();
          navigate('/login');
          return;
        }
        
        setLoading(true);
        // Fetch bookings
        const bookingsResponse = await axios.get('http://localhost:5000/api/customer/bookings', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setBookings(bookingsResponse.data);

        // Fetch services
        const servicesResponse = await axios.get('http://localhost:5000/api/services');
        setAvailableServices(servicesResponse.data);

        // Fetch customer profile
        const profileResponse = await axios.get('http://localhost:5000/api/customer/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCustomerProfile(profileResponse.data);
        setNewBookingForm(prev => ({ ...prev, address: profileResponse.data.profile?.address || '' }));

        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.response?.data?.message || 'Failed to load data. Please try again later.');
        if (err.response?.status === 401 || err.response?.status === 403) {
          logout();
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const intervalId = setInterval(fetchData, 5000); // Poll every 5 seconds
    return () => clearInterval(intervalId); // Clean up interval on component unmount
  }, [navigate]);

  // Handle booking cancellation
  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }
    
    try {
      const token = sessionStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/customer/bookings/${bookingId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSuccess('Booking cancelled successfully!');
      fetchData(); // Refresh bookings after cancellation
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error cancelling booking:', err);
      setError(err.response?.data?.message || 'Failed to cancel booking. Please try again.');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleNewBookingChange = (e) => {
    const { name, value } = e.target;
    setNewBookingForm(prev => ({ ...prev, [name]: value }));
    if (name === 'service') {
      // Reset problem when service changes
      setNewBookingForm(prev => ({ ...prev, problem: '', problemDescription: '' }));
    }
  };

  const handleNewBookingSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const selectedService = availableServices.find(s => s._id === newBookingForm.service);
    if (!selectedService) {
      setError('Please select a service.');
      return;
    }

    let finalProblemDescription = newBookingForm.problem;
    if (newBookingForm.problem === 'Other' && newBookingForm.problemDescription.trim()) {
      finalProblemDescription = newBookingForm.problemDescription.trim();
    } else if (newBookingForm.problem === 'Other' && !newBookingForm.problemDescription.trim()) {
      setError('Please describe your problem if you selected "Other".');
      return;
    } else if (!newBookingForm.problem) {
      setError('Please select a problem or describe it.');
      return;
    }

    if (!newBookingForm.date || !newBookingForm.time || !newBookingForm.address.trim()) {
      setError('Please fill all required fields (Date, Time, Address).');
      return;
    }

    try {
      const token = sessionStorage.getItem('token');
      await axios.post('http://localhost:5000/api/customer/bookings', {
        service: newBookingForm.service,
        date: newBookingForm.date,
        time: newBookingForm.time,
        address: newBookingForm.address.trim(),
        problemDescription: finalProblemDescription,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSuccess('Booking submitted successfully! Our team will contact you shortly.');
      setShowNewBookingModal(false);
      setNewBookingForm({
        service: '', problem: '', problemDescription: '', date: '', time: '', address: customerProfile?.profile?.address || ''
      });
      fetchData(); // Refresh bookings
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error creating booking:', err);
      setError(err.response?.data?.message || 'Failed to create booking. Please try again.');
      setTimeout(() => setError(null), 3000);
    }
  };

  const getServiceCategory = (serviceId) => {
    const service = availableServices.find(s => s._id === serviceId);
    return service ? service.category : 'Other';
  };

  const getProblemsForCategory = (category) => {
    return serviceProblems[category] || serviceProblems['Other'];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="text-center p-8">
        <p>Loading bookings...</p>
      </div>
    );
  }

  return (
    <div className="card profile-container">
      <h3 className="card-title text-center">📑 My Bookings</h3>
      
      {error && <div className="status-message error">{error}</div>}
      {success && <div className="status-message success">{success}</div>}

      <button onClick={() => setShowNewBookingModal(true)} className="btn btn-primary mb-4">
        ➕ Create New Booking
      </button>

      {bookings.length === 0 ? (
        <p className="text-center text-light">No bookings found. Book a service to see your bookings here.</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Booking ID</th>
              <th>Service</th>
              <th>Problem</th>
              <th>Date & Time</th>
              <th>Address</th>
              <th>Status</th>
              <th>Final Amount</th> {/* NEW: Final Amount column */}
              <th>Assigned Employee</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking._id}>
                <td>{booking._id.substring(0, 8)}</td>
                <td>{booking.service?.type || 'N/A'}</td>
                <td>{booking.problemDescription || 'N/A'}</td>
                <td>{formatDate(booking.date)} at {booking.time}</td>
                <td>{booking.address || 'N/A'}</td>
                <td>
                  <span className={`status-badge status-${booking.status.toLowerCase().replace(' ', '-')}`}>
                    {booking.status.replace(' - ', ' ').replace('awaiting admin confirmation', 'Awaiting Admin')}
                  </span>
                </td>
                <td>
                  {booking.status === 'Completed' && booking.adminConfirmed ? (
                    `₹${booking.finalAmount.toFixed(2)}`
                  ) : (
                    'N/A'
                  )}
                </td>
                <td>
                  {booking.employee ? (
                    <>
                      {booking.employee.profile?.name || 'N/A'}
                      <br />
                      {/* Make phone number a clickable link */}
                      <a href={`tel:${booking.employee.phone}`} className="text-secondary">
                        {booking.employee.phone || 'N/A'}
                      </a>
                    </>
                  ) : (
                    'Not Assigned'
                  )}
                </td>
                <td>
                  {(booking.status === "Pending" || booking.status === "In Progress") && (
                    <button
                      onClick={() => handleCancelBooking(booking._id)}
                      className="btn btn-danger btn-sm"
                    >
                      Cancel
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* New Booking Modal */}
      {showNewBookingModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title">Create New Booking</h3>
            <form onSubmit={handleNewBookingSubmit}>
              <div className="form-group">
                <label>Service:</label>
                <select
                  name="service"
                  value={newBookingForm.service}
                  onChange={handleNewBookingChange}
                  className="form-control"
                  required
                >
                  <option value="">Select Service</option>
                  {availableServices.map((service) => (
                    <option key={service._id} value={service._id}>{service.type} - ₹{service.price}</option>
                  ))}
                </select>
              </div>

              {newBookingForm.service && (
                <div className="form-group">
                  <label>Problem:</label>
                  <select
                    name="problem"
                    value={newBookingForm.problem}
                    onChange={handleNewBookingChange}
                    className="form-control"
                    required
                  >
                    <option value="">Select Problem</option>
                    {getProblemsForCategory(getServiceCategory(newBookingForm.service)).map((problem, index) => (
                      <option key={index} value={problem}>{problem}</option>
                    ))}
                    <option value="Other">Other (Please specify below)</option>
                  </select>
                </div>
              )}

              {newBookingForm.problem === 'Other' && (
                <div className="form-group">
                  <label>Problem Description:</label>
                  <textarea
                    name="problemDescription"
                    value={newBookingForm.problemDescription}
                    onChange={handleNewBookingChange}
                    className="form-control"
                    rows="3"
                    placeholder="Describe your problem in detail..."
                    required
                  ></textarea>
                </div>
              )}

              <div className="form-group">
                <label>Date:</label>
                <input
                  type="date"
                  name="date"
                  value={newBookingForm.date}
                  onChange={handleNewBookingChange}
                  className="form-control"
                  required
                />
              </div>

              <div className="form-group">
                <label>Time:</label>
                <input
                  type="time"
                  name="time"
                  value={newBookingForm.time}
                  onChange={handleNewBookingChange}
                  className="form-control"
                  required
                />
              </div>

              <div className="form-group">
                <label>Address:</label>
                <textarea
                  name="address"
                  value={newBookingForm.address}
                  onChange={handleNewBookingChange}
                  className="form-control"
                  rows="3"
                  required
                ></textarea>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setShowNewBookingModal(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Submit Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomerBookings;