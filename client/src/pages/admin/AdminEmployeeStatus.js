import React, { useState, useEffect } from 'react';
import api from '../api'; // This import is correct
import { useNavigate } from 'react-router-dom';

function AdminEmployeeStatus() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchEmployeeStatuses = async () => {
    try {
      setLoading(true);
      setError('');
      const token = sessionStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      // --- THIS IS THE LINE I FIXED ---
      const response = await api.get('/api/admin/employees/status', {
        headers: { Authorization: `Bearer ${token}` },
      });
      // --- END OF FIX ---

      setEmployees(response.data);
      console.log('[AdminEmployeeStatus] Fetched employees:', response.data); // Added log
    } catch (err) {
      console.error('Error fetching employee statuses:', err);
      setError(err.response?.data?.message || 'Failed to load employee statuses.');
      if (err.response?.status === 401 || err.response?.status === 403) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployeeStatuses(); // Initial fetch

    const intervalId = setInterval(fetchEmployeeStatuses, 5000); // Poll every 5 seconds

    return () => clearInterval(intervalId); // Clean up interval on component unmount
  }, [navigate]);

  if (loading) {
    return (
      <div className="text-center p-8">
        <p>Loading employee statuses...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 status-message error">
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="card admin-page-container">
      <h3 className="card-title text-center">🧑‍🔧 Employee Work Status Monitor</h3>
      
      <div style={{ textAlign: 'right', marginBottom: '1rem' }}>
        <button onClick={fetchEmployeeStatuses} className="btn btn-secondary btn-sm">
          Refresh Status
        </button>
      </div>

      {employees.length === 0 ? (
        <p className="text-center text-light">No employee data available.</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Employee Name</th>
              <th>Phone</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((employee) => {
              console.log(`[AdminEmployeeStatus] Rendering employee: ${employee.profile?.name}, workingStatus: ${employee.workingStatus}`); // Added log
              return (
                <tr key={employee._id}>
                  <td>{employee.profile?.name || 'N/A'}</td>
                  <td>{employee.phone || 'N/A'}</td>
                  <td>
                    <span
                      className={`status-badge ${employee.workingStatus === 'free' ? 'status-warning' : 'status-success'}`}
                    >
                      {employee.workingStatus?.toUpperCase() || 'N/A'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AdminEmployeeStatus;
