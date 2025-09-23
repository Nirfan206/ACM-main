// AdminUsers.js
import React, { useState, useEffect, useRef } from 'react';
import api from '../api'; 

// API base URL for admin user management
const API_URL = 'http://localhost:5000/api/admin/users';

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('customer'); // Use backend role names for tabs
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'customer', // Default to customer
    address: '',
  });
  const [loading, setLoading] = useState(true);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState(''); // NEW: Search term state

  const locations = [
    'Guntur','Prakasam','Krishna','Vijayawada','Nellore',
    'Ongole','Tenali','Narasaraopet'
  ];
  
  // Role mapping between display names and database values
  const roleDisplayMap = {
    'customer': 'Customer',
    'employee': 'Employee',
    'customercare': 'Customer Care',
    'admin': 'Admin'
  };
  const roles = Object.keys(roleDisplayMap); // Array of backend role names

  // Fetch users from database on mount
  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('token'); // Changed from localStorage
      if (!token) {
        setSubmitError("Authentication required. Please log in.");
        setLoading(false);
        return;
      }
      const { data } = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(data);
      setSubmitError('');
    } catch (err) {
      console.error('Fetch failed', err);
      setSubmitError(err.response?.data?.message || 'Failed to load users. Please check your connection or login again.');
    } finally {
      setLoading(false);
    }
  }

  function openModal(user = null) {
    setSubmitError('');
    setSubmitSuccess('');
    if (user) {
      setEditingUser(user);
      setForm({
        name: user.profile?.name || '',
        email: user.profile?.email || '',
        phone: user.phone || '',
        password: '', // Don't populate password for security
        role: user.role || 'customer',
        address: user.profile?.address || ''
      });
    } else {
      setEditingUser(null);
      setForm({
        name:'', email:'', phone:'', password:'', role:activeTab, address:''
      });
    }
    setShowModal(true);
  }

  async function saveUser() {
    setSubmitError('');
    setSubmitSuccess('');
    try {
      // Client-side validation
      if (!form.name.trim()) {
        setSubmitError('Name is required');
        return;
      }
      if (!form.phone.trim()) {
        setSubmitError('Phone number is required');
        return;
      }
      if (!/^\d{10}$/.test(form.phone.trim())) {
        setSubmitError('Phone number must be a 10-digit number');
        return;
      }
      if (!editingUser && !form.password.trim()) {
        setSubmitError('Password is required for new users');
        return;
      }
      if (form.password.trim() && form.password.trim().length < 6) {
        setSubmitError('Password must be at least 6 characters long');
        return;
      }
      if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
        setSubmitError('Invalid email format');
        return;
      }

      const token = sessionStorage.getItem('token'); // Changed from localStorage
      if (!token) {
        setSubmitError('You must be logged in');
        return;
      }

      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      // Format user data according to the database schema
      const userData = {
        phone: form.phone.trim(),
        role: form.role,
        profile: {
          name: form.name.trim(),
          email: form.email.trim() || '',
          address: form.address.trim() || ''
        }
      };

      // Only include password for new users or if password field is filled
      if (form.password.trim()) {
        userData.password = form.password.trim();
      }

      console.log('Sending user data:', userData); // Added console log

      if (editingUser) {
        // Update existing user
        await axios.put(`${API_URL}/${editingUser._id}`, userData, { headers });
        setSubmitSuccess('User updated successfully');
      } else {
        // Create new user
        await axios.post(API_URL, userData, { headers });
        setSubmitSuccess('User created successfully');
      }
      
      setShowModal(false);
      fetchUsers(); // Refresh the list
      setTimeout(() => setSubmitSuccess(''), 3000); // Clear success message
    } catch (error) {
      console.error('Error saving user:', error);
      setSubmitError(error.response?.data?.message || error.message);
    }
  }

  async function deleteUser(id) {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
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
      await fetchUsers();
      setSubmitSuccess('User deleted successfully');
      setTimeout(() => setSubmitSuccess(''), 3000); // Clear success message
    } catch (err) {
      console.error('Delete failed', err);
      setSubmitError(`Error deleting user: ${err.response?.data?.message || 'Unknown error'}`);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  }

  if (loading) {
    return <p className="text-center">Loading users...</p>;
  }

  const filteredUsers = users.filter(u => 
    u.role === activeTab &&
    (u.profile?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     u.phone?.includes(searchTerm) ||
     u.profile?.email?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="admin-page-container">
      <h2 className="page-title">User Management</h2>

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

      {/* Search Input */}
      <div className="form-group" style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Search by name, phone, or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="form-control"
        />
      </div>

      {/* Tabs */}
      <div className="tab-nav">
        {roles.map(r => (
          <button
            key={r}
            onClick={()=>setActiveTab(r)}
            className={`tab-button ${activeTab===r?'active':''}`}
          >
            {roleDisplayMap[r]}s ({users.filter(u=>u.role===r).length})
          </button>
        ))}
      </div>

      {/* Add User Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '1rem' }}>
        <button
          onClick={()=>openModal()}
          className="btn btn-accent"
        >
          ➕ Add {roleDisplayMap[activeTab]}
        </button>
      </div>

      {/* Table */}
      <div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              {(activeTab==='employee' || activeTab==='customer') && <th>Address</th>}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(u=>(
              <tr key={u._id}>
                <td>{u.profile?.name || 'N/A'}</td>
                <td>{u.profile?.email || 'N/A'}</td>
                <td>{u.phone || 'N/A'}</td>
                {(activeTab==='employee' || activeTab==='customer') && <td>{u.profile?.address || 'N/A'}</td>}
                <td>
                  <button 
                    onClick={()=>openModal(u)} 
                    className="btn btn-secondary btn-sm"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={()=>deleteUser(u._id)}
                    className="btn btn-danger btn-sm"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {filteredUsers.length===0&&(
              <tr>
                <td colSpan={activeTab==='employee' || activeTab==='customer' ? 5 : 4} className="text-center">
                  No {roleDisplayMap[activeTab].toLowerCase()}s found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal for Add/Edit */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title">{editingUser ? 'Edit User' : `Add New ${roleDisplayMap[activeTab]}`}</h3>
            
            <div className="form-group">
              <label>Name:</label>
              <input 
                name="name"
                type="text" 
                value={form.name} 
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>
            
            <div className="form-group">
              <label>Email:</label>
              <input 
                name="email"
                type="email" 
                value={form.email} 
                onChange={handleChange}
                className="form-control"
              />
            </div>
            
            <div className="form-group">
              <label>Phone:</label>
              <input 
                name="phone"
                type="text" 
                value={form.phone} 
                onChange={handleChange}
                className="form-control"
                required
                placeholder="10-digit number"
              />
            </div>
            
            <div className="form-group">
              <label>
                Password {editingUser && '(leave blank to keep current)'}:
              </label>
              <input 
                name="password"
                type="password" 
                value={form.password} 
                onChange={handleChange}
                className="form-control"
                required={!editingUser}
              />
            </div>
            
            <div className="form-group">
              <label>Role:</label>
              <select 
                name="role"
                value={form.role} 
                onChange={handleChange}
                className="form-control"
              >
                {roles.map(role=>(
                  <option key={role} value={role}>{roleDisplayMap[role]}</option>
                ))}
              </select>
            </div>
            
            {(form.role === 'employee' || form.role === 'customer') && (
              <div className="form-group">
                <label>
                  {form.role === 'employee' ? 'Work Address:' : 'Address:'}
                </label>
                {form.role === 'employee' ? (
                  <select 
                    name="address"
                    value={form.address} 
                    onChange={handleChange}
                    className="form-control"
                  >
                    <option value="">Select Location</option>
                    {locations.map(loc=>(
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                ) : (
                  <textarea
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    className="form-control"
                  />
                )}
              </div>
            )}
            
            <div className="modal-actions">
              <button 
                onClick={()=>setShowModal(false)} 
                className="btn btn-outline"
              >
                Cancel
              </button>
              <button 
                onClick={saveUser}
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

export default AdminUsers;
