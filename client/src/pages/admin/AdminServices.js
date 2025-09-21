import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

// API base URL for service management
const API_URL = 'http://localhost:5000/api/services';
const UPLOAD_URL = 'http://localhost:5000/api/upload/image'; // Backend image upload endpoint

function AdminServices() {
  const [services, setServices] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [form, setForm] = useState({
    type: '',
    description: '',
    category: '',
    imageUrl: '', // NEW: Add imageUrl to form state
  });
  const [imageFile, setImageFile] = useState(null); // NEW: State for the selected image file
  const [uploadingImage, setUploadingImage] = useState(false); // NEW: State for image upload loading
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
      const token = sessionStorage.getItem('token');
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
    setImageFile(null); // Clear selected image file
    if (service) {
      setEditingService(service);
      setForm({
        type: service.type || '',
        description: service.description || '',
        category: service.category || '',
        imageUrl: service.imageUrl || '', // Pre-fill imageUrl if exists
      });
    } else {
      setEditingService(null);
      setForm({ type: '', description: '', category: '', imageUrl: '' });
    }
    setShowModal(true);
  }

  const handleImageFileChange = (e) => {
    setImageFile(e.target.files[0]);
    setSubmitError(''); // Clear error when new file is selected
  };

  const uploadImage = async () => {
    if (!imageFile) {
      setSubmitError('Please select an image to upload.');
      return null;
    }

    setUploadingImage(true);
    setSubmitError('');
    try {
      const token = sessionStorage.getItem('token');
      const formData = new FormData();
      formData.append('image', imageFile);

      const response = await axios.post(UPLOAD_URL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });
      setUploadingImage(false);
      return response.data.imageUrl; // Return the Cloudinary URL
    } catch (error) {
      console.error('Error uploading image:', error);
      setSubmitError(error.response?.data?.message || 'Failed to upload image.');
      setUploadingImage(false);
      return null;
    }
  };

  async function saveService() {
    setSubmitError('');
    setSubmitSuccess('');
    try {
      // Client-side validation
      if (!form.type.trim()) {
        setSubmitError('Service Type is required');
        return;
      }
      if (!form.category.trim()) {
        setSubmitError('Category is required');
        return;
      }

      let finalImageUrl = form.imageUrl; // Start with existing image URL

      // If a new image file is selected, upload it
      if (imageFile) {
        const uploadedUrl = await uploadImage();
        if (!uploadedUrl) {
          // Error during upload, stop saving service
          return;
        }
        finalImageUrl = uploadedUrl;
      } else if (!finalImageUrl) {
        // If no new file and no existing URL, then image is missing
        setSubmitError('Service Image is required.');
        return;
      }

      const token = sessionStorage.getItem('token');
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
        category: form.category.trim(),
        imageUrl: finalImageUrl, // Use the final image URL
      };

      if (editingService) {
        await axios.put(`${API_URL}/${editingService._id}`, serviceData, { headers });
        setSubmitSuccess('Service updated successfully');
      } else {
        await axios.post(API_URL, serviceData, { headers });
        setSubmitSuccess('Service created successfully');
      }
      
      setShowModal(false);
      fetchServices();
      setTimeout(() => setSubmitSuccess(''), 3000);
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
      const token = sessionStorage.getItem('token');
      if (!token) {
        setSubmitError("Authentication required. Please log in.");
        return;
      }
      await axios.delete(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchServices();
      setSubmitSuccess('Service deleted successfully');
      setTimeout(() => setSubmitSuccess(''), 3000);
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
      <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '1rem' }}>
        <button
          onClick={() => openModal()}
          className="btn btn-accent"
        >
          ➕ Add New Service
        </button>
      </div>

      {/* Services Table */}
      <div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Description</th>
              <th>Category</th>
              <th>Image</th> {/* NEW: Image column */}
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
                  <td>{service.category}</td>
                  <td>
                    {service.imageUrl ? (
                      <img src={service.imageUrl} alt={service.type} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} />
                    ) : (
                      'No Image'
                    )}
                  </td>
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
      </div>

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
              <label>Category:</label>
              <input
                name="category"
                type="text"
                value={form.category}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>

            {/* NEW: Image Upload Field */}
            <div className="form-group">
              <label>Service Image:</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageFileChange}
                className="form-control"
              />
              {(form.imageUrl || imageFile) && (
                <div style={{ marginTop: '10px', textAlign: 'center' }}>
                  <p style={{ fontSize: '0.9rem', color: 'var(--color-textLight)' }}>Image Preview:</p>
                  <img 
                    src={imageFile ? URL.createObjectURL(imageFile) : form.imageUrl} 
                    alt="Service Preview" 
                    style={{ maxWidth: '150px', maxHeight: '150px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border)' }} 
                  />
                </div>
              )}
              {uploadingImage && <p style={{ color: 'var(--color-secondary)', textAlign: 'center', marginTop: '10px' }}>Uploading image...</p>}
            </div>

            <div className="modal-actions">
              <button
                type="button" // Changed to type="button" to prevent form submission before image upload
                onClick={() => setShowModal(false)}
                className="btn btn-outline"
                disabled={uploadingImage}
              >
                Cancel
              </button>
              <button
                type="button" // Changed to type="button" to prevent form submission before image upload
                onClick={saveService}
                className="btn btn-primary"
                disabled={uploadingImage || !form.type.trim() || !form.category.trim() || (!form.imageUrl && !imageFile)}
              >
                {uploadingImage ? 'Uploading...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminServices;