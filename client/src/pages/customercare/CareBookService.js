import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../utils/authUtils';

function CareBookService() {
  const [customers, setCustomers] = useState([]);
  const [availableServices, setAvailableServices] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [newBookingForm, setNewBookingForm] = useState({
    service: '',
    problem: '', // Stores selected problem from dropdown
    problemDescription: '', // Stores detailed problem if 'Other' is selected
    date: '',
    time: '',
    address: '',
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  // Define common problems for each service category (duplicated from CustomerBookings for UI logic)
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

  useEffect(() => {
    fetchInitialData();
  }, [navigate]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      setError('');
      const token = sessionStorage.getItem('token');
      if (!token) {
        logout();
        navigate('/login');
        return;
      }

      // Fetch customers
      const customersResponse = await axios.get('http://localhost:5000/api/customercare/customers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCustomers(customersResponse.data);

      // Fetch services
      const servicesResponse = await axios.get('http://localhost:5000/api/services');
      setAvailableServices(servicesResponse.data);

    } catch (err) {
      console.error('Error fetching initial data:', err);
      setError(err.response?.data?.message || 'Failed to load data. Please try again.');
      if (err.response?.status === 401 || err.response?.status === 403) {
        logout();
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerChange = (e) => {
    const customerId = e.target.value;
    setSelectedCustomer(customerId);
    // Pre-fill address if customer is selected
    const customer = customers.find(c => c._id === customerId);
    setNewBookingForm(prev => ({ ...prev, address: customer?.profile?.address || '' }));
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
    setError('');
    setSuccess('');
    setSubmitting(true);

    if (!selectedCustomer) {
      setError('Please select a customer.');
      setSubmitting(false);
      return;
    }

    const selectedService = availableServices.find(s => s._id === newBookingForm.service);
    if (!selectedService) {
      setError('Please select a service.');
      setSubmitting(false);
      return;
    }

    let finalProblemDescription = newBookingForm.problem;
    if (newBookingForm.problem === 'Other' && newBookingForm.problemDescription.trim()) {
      finalProblemDescription = newBookingForm.problemDescription.trim();
    } else if (newBookingForm.problem === 'Other' && !newBookingForm.problemDescription.trim()) {
      setError('Please describe the problem if "Other" is selected.');
      setSubmitting(false);
      return;
    } else if (!newBookingForm.problem) {
      setError('Please select a problem or describe it.');
      setSubmitting(false);
      return;
    }

    if (!newBookingForm.date || !newBookingForm.time || !newBookingForm.address.trim()) {
      setError('Please fill all required fields (Date, Time, Address).');
      setSubmitting(false);
      return;
    }

    try {
      const token = sessionStorage.getItem('token');
      await axios.post('http://localhost:5000/api/customercare/bookings', {
        userId: selectedCustomer, // Send customer ID
        service: newBookingForm.service,
        date: newBookingForm.date,
        time: newBookingForm.time,
        address: newBookingForm.address.trim(),
        problemDescription: finalProblemDescription,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSuccess('Booking created successfully for the customer!');
      // Reset form
      setSelectedCustomer('');
      setNewBookingForm({
        service: '', problem: '', problemDescription: '', date: '', time: '', address: ''
      });
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error creating booking:', err);
      setError(err.response?.data?.message || 'Failed to create booking. Please try again.');
      setTimeout(() => setError(''), 3000);
    } finally {
      setSubmitting(false);
    }
  };

  const getServiceCategory = (serviceId) => {
    const service = availableServices.find(s => s._id === serviceId);
    return service ? service.category : 'Other';
  };

  const getProblemsForCategory = (category) => {
    return serviceProblems[category] || serviceProblems['Other'];
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
      <h3 className="card-title text-center">➕ Book Service for Customer</h3>
      
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
              <option key={service._id} value={service._id}>{service.type}</option>
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
              placeholder="Describe the problem in detail..."
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

        <div className="text-center mt-4">
          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary"
          >
            {submitting ? 'Submitting...' : 'Create Booking'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CareBookService;