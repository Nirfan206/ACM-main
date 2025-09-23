import React, { useState, useEffect } from 'react';
import api from '../api'; 
import { useNavigate } from 'react-router-dom';
import { getUserRole, logout } from '../../utils/authUtils'; // Import auth utilities

function EmployeeStatus() {
  const [workingStatus, setWorkingStatus] = useState('free'); // 'free' or 'working'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const currentUserRole = getUserRole(); // Get current user's role

  useEffect(() => {
    console.log('[EmployeeStatus] Component mounted. Starting fetch interval.');
    fetchWorkingStatus();
    const intervalId = setInterval(fetchWorkingStatus, 5000); // Poll every 5 seconds
    return () => {
      console.log('[EmployeeStatus] Component unmounted. Clearing fetch interval.');
      clearInterval(intervalId); // Clean up interval on component unmount
    };
  }, []);

  const fetchWorkingStatus = async () => {
    console.log('[EmployeeStatus] fetchWorkingStatus called.');
    try {
      setLoading(true);
      setError('');
      const token = sessionStorage.getItem('token');
      if (!token) {
        console.warn('[EmployeeStatus] No token found, logging out.');
        logout();
        navigate('/login');
        return;
      }
      const response = await axios.get('http://localhost:5000/api/employee/status', {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('[EmployeeStatus] Fetched working status response data:', response.data);
      const newStatus = response.data.workingStatus;
      console.log(`[EmployeeStatus] Current DB status: ${newStatus}, UI status: ${workingStatus}`);
      if (newStatus !== workingStatus) {
        setWorkingStatus(newStatus);
        console.log(`[EmployeeStatus] UI status updated to: ${newStatus}`);
      }
    } catch (err) {
      console.error('Error fetching working status:', err);
      setError(err.response?.data?.message || 'Failed to load working status.');
      if (err.response?.status === 401 || err.response?.status === 403) {
        console.warn('[EmployeeStatus] Auth error during fetch, logging out.');
        logout();
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const setEmployeeStatus = async (status) => {
    console.log(`[EmployeeStatus] setEmployeeStatus called with desired status: ${status}. Current UI status: ${workingStatus}`);
    try {
      setError('');
      setSuccess('');
      const token = sessionStorage.getItem('token');
      
      if (!token) {
        console.warn('[EmployeeStatus] No token found for setStatus, logging out.');
        setError("Authentication required. Please log in.");
        logout();
        navigate('/login');
        return;
      }

      // The backend toggleWorkingStatus now simply flips the boolean 'isWorking'.
      // We need to call it if the current status is NOT the desired status.
      if ((status === 'free' && workingStatus === 'working') || (status === 'working' && workingStatus === 'free')) {
        console.log(`[EmployeeStatus] Calling toggle API. Current UI status: ${workingStatus}, Desired: ${status}`);
        const response = await axios.put('http://localhost:5000/api/employee/status/toggle', {}, { // No body needed, it's a toggle
          headers: { Authorization: `Bearer ${token}` },
        });
        
        console.log('[EmployeeStatus] Full Set status response data:', response.data);
        const newWorkingStatus = response.data.workingStatus;
        setWorkingStatus(newWorkingStatus);
        
        if (newWorkingStatus) {
          setSuccess(`Status updated to: ${newWorkingStatus.toUpperCase()}!`);
          console.log(`[EmployeeStatus] UI status updated to: ${newWorkingStatus} after toggle.`);
        } else {
          setSuccess('Status updated, but new status value was unexpected.');
          console.warn('[EmployeeStatus] Unexpected new status value from toggle API.');
        }
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setSuccess(`Status is already ${status.toUpperCase()}.`);
        console.log(`[EmployeeStatus] Status already ${status.toUpperCase()}, no API call made.`);
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      console.error('Error setting working status:', err);
      setError(err.response?.data?.message || 'Failed to update working status.');
      if (err.response?.status === 401 || err.response?.status === 403) {
        console.warn('[EmployeeStatus] Auth error during setStatus, logging out.');
        logout();
        navigate('/login');
      }
      setTimeout(() => setError(''), 3000);
    }
  };

  if (loading) {
    return (
      <div className="text-center p-8">
        <p>Loading status...</p>
      </div>
    );
  }

  return (
    <div className="card" style={{ maxWidth: 600, margin: "2rem auto" }}>
      <h3 className="card-title text-center" style={{ color: 'var(--color-secondary)' }}>My Status</h3>
      <p className="text-center text-light">Logged in as: <span className="font-bold" style={{ color: 'var(--color-accent)' }}>{currentUserRole?.toUpperCase() || 'N/A'}</span></p>

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

      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <p style={{ fontSize: '1.1rem', color: 'var(--color-text)' }}>Current Working Status:</p>
        <span
          className={`status-badge ${workingStatus === 'free' ? 'status-warning' : 'status-success'}`}
          style={{ 
            fontSize: '1.2rem', 
            padding: '8px 15px',
            color: workingStatus === 'free' ? 'var(--color-dark)' : 'var(--color-white)'
          }}
        >
          {workingStatus?.toUpperCase() || 'N/A'}
        </span>
      </div>

      <div style={{ textAlign: 'center', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
        <button
          onClick={() => setEmployeeStatus('free')}
          className={`btn ${workingStatus === 'free' ? 'btn-warning' : 'btn-outline'}`}
          disabled={workingStatus === 'free'}
        >
          Set Free
        </button>
        <button
          onClick={() => setEmployeeStatus('working')}
          className={`btn ${workingStatus === 'working' ? 'btn-primary' : 'btn-outline'}`}
          disabled={workingStatus === 'working'}
        >
          Set Working
        </button>
      </div>

      <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
        <h4 style={{ textAlign: 'center', marginBottom: '1rem', color: 'var(--color-text)' }}>Current Assignment:</h4>
        <p style={{ textAlign: 'center', color: 'var(--color-textLight)' }}>No current assignment.</p>
      </div>
    </div>
  );
}

export default EmployeeStatus;
