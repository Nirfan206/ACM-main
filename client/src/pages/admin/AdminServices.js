import React, { useState, useEffect, useRef } from 'react';
import api from '../api'; 

function AdminServices() {
  const [services, setServices] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [form, setForm] = useState({
    type: '',
    description: '',
    category: '',
    imageUrl: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');

  useEffect(() => {
    fetchServices();
  }, []);

  async function fetchServices() {
    try {
      setLoading(true);
      setSubmitError('');
      const token = sessionStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const { data } = await api.get('/api/services', { headers });
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
    setImageFile(null);
    if (service) {
      setEditingService(service);
      setForm({
        type: service.type || '',
        description: service.description || '',
        category: service.category || '',
        imageUrl: service.imageUrl || '',
      });
    } else {
      setEditingService(null);
      setForm({ type: '', description: '', category: '', imageUrl: '' });
    }
    setShowModal(true);
  }

  const handleImageFileChange = (e) => {
    setImageFile(e.target.files[0]);
    setSubmitError('');
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

      const response = await api.post('/api/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });
      setUploadingImage(false);
      return response.data.imageUrl;
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
      if (!form.type.trim()) {
        setSubmitError('Service Type is required');
        return;
      }
      if (!form.category.trim()) {
        setSubmitError('Category is required');
        return;
      }

      let finalImageUrl = form.imageUrl;

      if (imageFile) {
        const uploadedUrl = await uploadImage();
        if (!uploadedUrl) {
          return;
        }
        finalImageUrl = uploadedUrl;
      } else if (!finalImageUrl && !editingService) { // Image is required for new services
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
        imageUrl: finalImageUrl,
      };

      if (editingService) {
        await api.put(`/api/services/${editingService._id}`, serviceData, { headers });
        setSubmitSuccess('Service updated successfully');
      } else {
        await api.post('/api/services', serviceData, { headers });
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
      await api.delete(`/api/services/${id}`, {
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

      <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '1rem' }}>
        <button
          onClick={() => openModal()}
          className="btn btn-accent"
        >
          ➕ Add New Service
        </button>
      </div>

      <div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Description</th>
              <th>Category</th>
              <th>Image</th>
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
                type="button"
                onClick={() => setShowModal(false)}
                className="btn btn-outline"
                disabled={uploadingImage}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveService}
                className="btn btn-primary"
                disabled={uploadingImage || !form.type.trim() || !form.category.trim() || (!form.imageUrl && !imageFile && !editingService)}
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
