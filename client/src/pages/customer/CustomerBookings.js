import React, { useEffect, useState } from "react";
import api from "../../api";
import { useNavigate } from "react-router-dom";
import { logout } from "../../utils/authUtils";

function CustomerBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showNewBookingModal, setShowNewBookingModal] = useState(false);
  const [availableServices, setAvailableServices] = useState([]);
  const [customerProfile, setCustomerProfile] = useState(null);
  const [newBookingForm, setNewBookingForm] = useState({
    service: "",
    problem: "",
    problemDescription: "",
    date: "",
    time: "",
    address: ""
  });

  const navigate = useNavigate();

  const serviceProblems = {
    AC: [
      "AC not cooling",
      "Water leakage from AC",
      "AC making noise",
      "AC not turning on",
      "Bad odor from AC",
      "AC gas refilling"
    ],
    Fridge: [
      "Fridge not cooling",
      "Water leakage from fridge",
      "Fridge making noise",
      "Fridge not turning on",
      "Excessive frosting",
      "Door seal broken"
    ],
    "Washing Machine": [
      "Washing machine not draining",
      "Washing machine not spinning",
      "Washing machine making noise",
      "Washing machine not turning on",
      "Water leakage from washing machine",
      "Drum not rotating"
    ],
    Electrical: [
      "Power outage in specific area",
      "Faulty wiring",
      "Socket repair/replacement",
      "Light fixture installation/repair",
      "Circuit breaker tripping",
      "Fan repair/installation"
    ],
    Other: []
  };

  const fetchData = async () => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        logout();
        navigate("/login", { replace: true });
        return;
      }

      setLoading(true);
      const headers = { Authorization: `Bearer ${token}` };

      const [bookingsRes, servicesRes, profileRes] = await Promise.all([
        api.get("/api/customer/bookings", { headers }),
        api.get("/api/services"),
        api.get("/api/customer/profile", { headers })
      ]);

      setBookings(bookingsRes.data || []);
      setAvailableServices(servicesRes.data || []);
      setCustomerProfile(profileRes.data || null);
      setNewBookingForm((prev) => ({
        ...prev,
        address: profileRes.data?.profile?.address || ""
      }));

      setError(null);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err.response?.data?.message || "Failed to load data. Please try again later.");
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
    // Initial fetch only; removed 5s polling interval
    fetchData();
  }, [navigate]);

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;

    try {
      const token = sessionStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      await api.delete(`/api/customer/bookings/${bookingId}`, { headers });

      setSuccess("Booking cancelled successfully!");
      // Optimistic update
      setBookings((prev) => prev.filter((b) => b._id !== bookingId));
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error cancelling booking:", err);
      setError(err.response?.data?.message || "Failed to cancel booking. Please try again.");
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleNewBookingChange = (e) => {
    const { name, value } = e.target;
    setNewBookingForm((prev) => ({ ...prev, [name]: value }));
    if (name === "service") {
      setNewBookingForm((prev) => ({ ...prev, problem: "", problemDescription: "" }));
    }
  };

  const handleNewBookingSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const selectedService = availableServices.find((s) => s._id === newBookingForm.service);
    if (!selectedService) {
      setError("Please select a service.");
      return;
    }

    let finalProblemDescription = newBookingForm.problem;
    if (newBookingForm.problem === "Other" && newBookingForm.problemDescription.trim()) {
      finalProblemDescription = newBookingForm.problemDescription.trim();
    } else if (newBookingForm.problem === "Other" && !newBookingForm.problemDescription.trim()) {
      setError('Please describe your problem if you selected "Other".');
      return;
    } else if (!newBookingForm.problem) {
      setError("Please select a problem or describe it.");
      return;
    }

    if (!newBookingForm.date || !newBookingForm.time || !newBookingForm.address.trim()) {
      setError("Please fill all required fields (Date, Time, Address).");
      return;
    }

    try {
      const token = sessionStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const res = await api.post(
        "/api/customer/bookings",
        {
          service: newBookingForm.service,
          date: newBookingForm.date,
          time: newBookingForm.time,
          address: newBookingForm.address.trim(),
          problemDescription: finalProblemDescription
        },
        { headers }
      );

      // Optimistic prepend of new booking if API returns it; otherwise refetch.
      const created = res.data;
      if (created && created._id) {
        setBookings((prev) => [created, ...prev]);
      } else {
        fetchData();
      }

      setSuccess("Booking submitted successfully! Our team will contact shortly.");
      setShowNewBookingModal(false);
      setNewBookingForm({
        service: "",
        problem: "",
        problemDescription: "",
        date: "",
        time: "",
        address: customerProfile?.profile?.address || ""
      });
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error creating booking:", err);
      setError(err.response?.data?.message || "Failed to create booking. Please try again.");
      setTimeout(() => setError(null), 3000);
    }
  };

  const getServiceCategory = (serviceId) => {
    const service = availableServices.find((s) => s._id === serviceId);
    return service ? service.category : "Other";
  };

  const getProblemsForCategory = (category) => {
    return serviceProblems[category] || serviceProblems.Other;
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric"
    });

  if (loading) {
    return (
      <div className="text-center p-8">
        <p>Loading bookings...</p>
      </div>
    );
  }

  return (
    <div className="card profile-container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 className="card-title text-center">📑 My Bookings</h3>
        <button onClick={fetchData} className="btn btn-outline">Refresh</button>
      </div>

      {error && <div className="status-message error">{error}</div>}
      {success && <div className="status-message success">{success}</div>}

      <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: "1rem" }}>
        <button onClick={() => setShowNewBookingModal(true)} className="btn btn-primary">
          ➕ Create New Booking
        </button>
      </div>

      <div>
        {bookings.length === 0 ? (
          <p className="text-center text-light">
            No bookings found. Book a service to see your bookings here.
          </p>
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
                <th>Assigned Employee</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking._id}>
                  <td>{booking._id.substring(0, 8)}</td>
                  <td>{booking.service?.type || "N/A"}</td>
                  <td>{booking.problemDescription || "N/A"}</td>
                  <td>
                    {formatDate(booking.date)} at {booking.time}
                  </td>
                  <td>{booking.address || "N/A"}</td>
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
                  <td>
                    {booking.employee ? (
                      <>
                        {booking.employee.profile?.name || "N/A"}
                        <br />
                        <a href={`tel:${booking.employee.phone}`} className="text-secondary">
                          {booking.employee.phone || "N/A"}
                        </a>
                      </>
                    ) : (
                      "Not Assigned"
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
      </div>

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
                    <option key={service._id} value={service._id}>
                      {service.type}
                    </option>
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
                    {getProblemsForCategory(getServiceCategory(newBookingForm.service)).map(
                      (problem, index) => (
                        <option key={index} value={problem}>
                          {problem}
                        </option>
                      )
                    )}
                    <option value="Other">Other (Please specify below)</option>
                  </select>
                </div>
              )}

              {newBookingForm.problem === "Other" && (
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
                  />
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
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setShowNewBookingModal(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
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
