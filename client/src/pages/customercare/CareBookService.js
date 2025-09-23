import React, { useEffect, useState } from "react";
import api from "../../api";
import { useNavigate } from "react-router-dom";
import { logout } from "../../utils/authUtils";

function CareBookService() {
  const [customers, setCustomers] = useState([]);
  const [availableServices, setAvailableServices] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [newBookingForm, setNewBookingForm] = useState({
    service: "",
    problem: "",
    problemDescription: "",
    date: "",
    time: "",
    address: ""
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
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

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      setError("");

      const token = sessionStorage.getItem("token");
      if (!token) {
        logout();
        navigate("/login", { replace: true });
        return;
      }

      const [customersResponse, servicesResponse] = await Promise.all([
        api.get("/api/customercare/customers", {
          headers: { Authorization: `Bearer ${token}` }
        }),
        api.get("/api/services")
      ]);

      setCustomers(customersResponse.data || []);
      setAvailableServices(servicesResponse.data || []);
    } catch (err) {
      console.error("Error fetching initial data:", err);
      setError(err.response?.data?.message || "Failed to load data. Please try again.");
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
    fetchInitialData();
  }, [navigate]);

  const handleCustomerChange = (e) => {
    const customerId = e.target.value;
    setSelectedCustomer(customerId);
    const customer = customers.find((c) => c._id === customerId);
    setNewBookingForm((prev) => ({ ...prev, address: customer?.profile?.address || "" }));
  };

  const handleNewBookingChange = (e) => {
    const { name, value } = e.target;
    setNewBookingForm((prev) => ({ ...prev, [name]: value }));
    if (name === "service") {
      // Reset problem selections when service changes
      setNewBookingForm((prev) => ({ ...prev, problem: "", problemDescription: "" }));
    }
  };

  const getServiceCategory = (serviceId) => {
    const service = availableServices.find((s) => s._id === serviceId);
    return service ? service.category : "Other";
  };

  const getProblemsForCategory = (category) => {
    return serviceProblems[category] || serviceProblems.Other;
  };

  const handleNewBookingSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    if (!selectedCustomer) {
      setError("Please select a customer.");
      setSubmitting(false);
      return;
    }

    const selectedService = availableServices.find((s) => s._id === newBookingForm.service);
    if (!selectedService) {
      setError("Please select a service.");
      setSubmitting(false);
      return;
    }

    let finalProblemDescription = newBookingForm.problem;
    if (newBookingForm.problem === "Other" && newBookingForm.problemDescription.trim()) {
      finalProblemDescription = newBookingForm.problemDescription.trim();
    } else if (newBookingForm.problem === "Other" && !newBookingForm.problemDescription.trim()) {
      setError('Please describe the problem if "Other" is selected.');
      setSubmitting(false);
      return;
    } else if (!newBookingForm.problem) {
      setError("Please select a problem or describe it.");
      setSubmitting(false);
      return;
    }

    if (!newBookingForm.date || !newBookingForm.time || !newBookingForm.address.trim()) {
      setError("Please fill all required fields (Date, Time, Address).");
      setSubmitting(false);
      return;
    }

    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        logout();
        navigate("/login", { replace: true });
        return;
      }

      await api.post(
        "/api/customercare/bookings",
        {
          userId: selectedCustomer,
          service: newBookingForm.service,
          date: newBookingForm.date,
          time: newBookingForm.time,
          address: newBookingForm.address.trim(),
          problemDescription: finalProblemDescription
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess("Booking created successfully for the customer!");
      setSelectedCustomer("");
      setNewBookingForm({
        service: "",
        problem: "",
        problemDescription: "",
        date: "",
        time: "",
        address: ""
      });
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Error creating booking:", err);
      setError(err.response?.data?.message || "Failed to create booking. Please try again.");
      setTimeout(() => setError(""), 3000);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center p-8">
        <p>Loading data...</p>
      </div>
    );
  }

  return (
    <div className="card admin-page-container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 className="card-title">➕ Book Service for Customer</h3>
        <button onClick={fetchInitialData} className="btn btn-outline">Refresh</button>
      </div>

      {error && <div className="status-message error">{error}</div>}
      {success && <div className="status-message success">{success}</div>}

      <form onSubmit={handleNewBookingSubmit}>
        <div className="form-group">
          <label>Select Customer:</label>
          <select
            value={selectedCustomer}
            onChange={handleCustomerChange}
            className="form-control"
            required
          >
            <option value="">Select a Customer</option>
            {customers.map((customer) => (
              <option key={customer._id} value={customer._id}>
                {customer.profile?.name} ({customer.phone})
              </option>
            ))}
          </select>
        </div>

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
              {getProblemsForCategory(getServiceCategory(newBookingForm.service)).map((problem, idx) => (
                <option key={idx} value={problem}>
                  {problem}
                </option>
              ))}
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
              placeholder="Describe the problem in detail..."
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

        <div className="text-center mt-4">
          <button type="submit" disabled={submitting} className="btn btn-primary">
            {submitting ? "Submitting..." : "Create Booking"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CareBookService;
