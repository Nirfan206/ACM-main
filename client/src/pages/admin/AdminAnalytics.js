import React, { useState, useEffect } from 'react';
import api from '../api'; // This import is correct
import { useNavigate } from 'react-router-dom';
import { logout } from '../../utils/authUtils'; // Import logout utility

function AdminAnalytics() {
  const [analyticsData, setAnalyticsData] = useState({
    totalBookings: 0,
    employeePerformance: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError('');
        const token = sessionStorage.getItem('token');
        if (!token) {
          logout();
          navigate('/login');
          return;
        }

        // --- THIS IS THE LINE I FIXED ---
        // It now uses 'api' instead of 'axios' and a relative URL.
        const response = await api.get('/api/analytics', {
          headers: { Authorization: `Bearer ${token}` },
        });
        // --- END OF FIX ---
        
        setAnalyticsData(response.data);
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError(err.response?.data?.message || 'Failed to load analytics data.');
        if (err.response?.status === 401 || err.response?.status === 403) {
          logout();
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [navigate]);

  if (loading) {
    return (
      <div className="text-center p-8">
        <p>Loading analytics...</p>
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

  // Find the top employee based on jobsCompleted
  const topEmployee = analyticsData.employeePerformance.reduce((prev, current) => 
    (prev.jobsCompleted > current.jobsCompleted) ? prev : current, 
    { name: 'N/A', jobsCompleted: 0 }
  );

  return (
    <div className="card admin-page-container">
      <h3 className="card-title text-center">📊 Admin Analytics</h3>
      
      <div className="grid-container mb-4">
        <div className="card text-center bg-light">
          <h4>Total Bookings</h4>
          <p className="text-2xl font-bold text-secondary">{analyticsData.totalBookings}</p>
        </div>

        <div className="card text-center bg-light">
          <h4>Top Employee (by jobs)</h4>
          <p className="text-xl font-bold text-accent">
            {topEmployee.name} ({topEmployee.jobsCompleted} jobs)
          </p>
        </div>
      </div>

      <div className="mt-8">
        <h4 className="mb-4 text-dark">Employee Performance (Job Counts)</h4>
        {analyticsData.employeePerformance.length === 0 ? (
          <p className="text-center text-light">No employee performance data available.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Employee Name</th>
                <th>Jobs Completed</th>
                <th>Working Status</th>
              </tr>
            </thead>
            <tbody>
              {analyticsData.employeePerformance.map((employee, index) => (
                <tr key={index}>
                  <td>{employee.name}</td>
                  <td>{employee.jobsCompleted}</td>
                  <td>
                    <span className={`status-badge ${employee.isWorking ? 'status-success' : 'status-pending'}`}>
                      {employee.isWorking ? 'Working' : 'Free'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default AdminAnalytics;
