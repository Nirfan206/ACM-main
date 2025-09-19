import React, { useState, useEffect } from 'react';
import axios from 'axios';

// API base URL for service management
const API_URL = 'http://localhost:5000/api/services';

function AdminServices() {
  const [services, setServices] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [form, setForm] = useState({
    type: '',
    description: '',
    price: '',
    category: '',
  });
  const [loading, setLoading] = useState(true);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');

  // Fetch services from database on mount
  useEffect(() => {
    fetchServices();
  }, []);

  async function fetchServices() {
    try {
      setLoading(true);
      setSubmitError('');
      const token = sessionStorage.getItem('token'); // Changed from localStorage
      // Services route is public for GET, but admin routes are protected.
      // For consistency, we'll include token if available, though not strictly needed for GET /api/services
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const { data } = await axios.get(API_URL, { headers });
      setServices(data);
    } catch (err) {
      console.error('Error fetching services:', err);
      setSubmitError(err.response?.data?.message || 'Failed to load services. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function openModal(service = null) {
    setSubmitError('');
    setSubmitSuccess('');
    if (service) {
      setEditingService(service);
      setForm({
        type: service.type || '',
        description: service.description || '',
        price: service.price || '',
        category: service.category || '',
      });
    } else {
      setEditingService(null);
      setForm({ type: '', description: '', price: '', category: '' });
    }
    setShowModal(true);
  }

  async function saveService() {
    setSubmitError('');
    setSubmitSuccess('');
    try {
      // Client-side validation
      if (!form.type.trim()) {
        setSubmitError('Service Type is required');
        return;
      }
      if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0) {
        setSubmitError('Price must be a positive number');
        return;
      }

      const token = sessionStorage.getItem('token'); // Changed from localStorage
      if (!token) {
        setSubmitError('Authentication required. Please log in.');
        return;
      }

      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      const serviceData = {
        type: form.type.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        category: form.category.trim(),
      };

      if (editingService) {
        // Update existing service
        await axios.put(`${API_URL}/${editingService._id}`, serviceData, { headers });
        setSubmitSuccess('Service updated successfully');
      } else {
        // Create new service
        await axios.post(API_URL, serviceData, { headers });
        setSubmitSuccess('Service created successfully');
      }
      
      setShowModal(false);
      fetchServices(); // Refresh the list
      setTimeout(() => setSubmitSuccess(''), 3000); // Clear success message
    } catch (error) {
      console.error('Error saving service:', error);
      setSubmitError(error.response?.data?.message || error.message);
    }
  }

  async function deleteService(id) {
    if (!window.confirm('Are you sure you want to delete this service?')) return;
    setSubmitError('');
    setSubmitSuccess('');
    try {
      const token = sessionStorage.getItem('token'); // Changed from localStorage
      if (!token) {
        setSubmitError("Authentication required. Please log in.");
        return;
      }
      await axios.delete(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchServices();
      setSubmitSuccess('Service deleted successfully');
      setTimeout(() => setSubmitSuccess(''), 3000); // Clear success message
    } catch (err) {
      console.error('Delete failed', err);
      setSubmitError(`Error deleting service: ${err.response?.data?.message || 'Unknown error'}`);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  }

  if (loading) {
    return <p className="text-center">Loading services...</p>;
  }

  return (
    <div className="admin-page-container">
      <h2 className="page-title">Service Management</h2>

      {submitError && (
        <div className="status-message error">
          {submitError}
        </div>
      )}
      {submitSuccess && (
        <div className="status-message success">
          {submitSuccess}
        </div>
      )}

      {/* Add Service Button */}
      <button
        onClick={() => openModal()}
        className="btn btn-accent"
      >
        ➕ Add New Service
      </button>

      {/* Services Table */}
      <table className="data-table">
        <thead>
          <tr>
            <th>Type</th>
            <th>Description</th>
            <th>Price (₹)</th>
            <th>Category</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {services.length === 0 ? (
            <tr>
              <td colSpan="6" className="text-center">
                No services found.
              </td>
            </tr>
          ) : (
            services.map(service => (
              <tr key={service._id}>
                <td>{service.type}</td>
                <td>{service.description}</td>
                <td>₹{service.price.toFixed(2)}</td>
                <td>{service.category}</td>
                <td>
                  <span
                    className={`status-badge ${service.status === 'active' ? 'status-success' : 'status-error'}`}
                  >
                    {service.status}
                  </span>
                </td>
                <td>
                  <button
                    onClick={() => openModal(service)}
                    className="btn btn-secondary btn-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteService(service._id)}
                    className="btn btn-danger btn-sm"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Modal for Add/Edit Service */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title">{editingService ? 'Edit Service' : 'Add New Service'}</h3>

            <div className="form-group">
              <label>Service Type:</label>
              <input
                name="type"
                type="text"
                value={form.type}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>

            <div className="form-group">
              <label>Description:</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label>Price (₹):</label>
              <input
                name="price"
                type="number"
                value={form.price}
                onChange={handleChange}
                className="form-control"
                required
                min="0"
                step="0.01"
              />
            </div>

            <div className="form-group">
              <label>Category:</label>
              <input
                name="category"
                type="text"
                value={form.category}
                onChange={handleChange}
                className="form-control"
              />
            </div>

            <div className="modal-actions">
              <button
                onClick={() => setShowModal(false)}
                className="btn btn-outline"
              >
                Cancel
              </button>
              <button
                onClick={saveService}
                className="btn btn-primary"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminServices;