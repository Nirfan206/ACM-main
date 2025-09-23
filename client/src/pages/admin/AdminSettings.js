import React, { useState, useEffect } from 'react';
import api from '../../api';

function AdminSettings() {
  const [settings, setSettings] = useState({
    siteName: 'AL CHAAN MEERA',
    bannerUrl: '',
    allowBookings: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Fetch settings on component mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const token = sessionStorage.getItem('token');
        const response = await api.get('/api/admin/settings', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSettings(response.data);
        setError('');
      } catch (err) {
        console.error('Error fetching settings:', err);
        setError('Failed to load settings. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings({
      ...settings,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      
      const token = sessionStorage.getItem('token');
      await api.put(
        '/api/admin/settings',
        settings,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setSuccess('Settings saved successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (err) {
      console.error('Error saving settings:', err);
      setError(err.response?.data?.message || 'Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center p-8">
        <p>Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="card admin-page-container">
      <h3 className="card-title text-center">⚙️ Site Settings</h3>
      
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

      <form onSubmit={handleSave}>
        <div className="form-group">
          <label>
            Site Name:
            <input
              type="text"
              name="siteName"
              value={settings.siteName}
              onChange={handleChange}
              className="form-control"
            />
          </label>
        </div>

        <div className="form-group">
          <label>
            Banner Image URL:
            <input
              type="text"
              name="bannerUrl"
              value={settings.bannerUrl}
              onChange={handleChange}
              className="form-control"
            />
          </label>
        </div>

        <div className="form-group checkbox-group">
          <label>
            <input
              type="checkbox"
              name="allowBookings"
              checked={settings.allowBookings}
              onChange={handleChange}
            />
            Allow Customer Bookings
          </label>
        </div>

        <button
          type="submit"
          disabled={saving}
          className={`btn ${saving ? 'btn-disabled' : 'btn-primary'}`}
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
}

export default AdminSettings;
