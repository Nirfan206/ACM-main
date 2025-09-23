import React, { useState, useEffect } from "react";
import api from '../../api';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../utils/authUtils'; // Import logout utility

function EmployeeEarnings() {
  const [jobSummary, setJobSummary] = useState({
    totalAssigned: 0,
    completed: 0,
    inProgress: 0,
    pending: 0,
    cancelled: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch job summary data from API
  useEffect(() => {
    const fetchJobSummary = async () => {
      try {
        setLoading(true);
        const token = sessionStorage.getItem('token'); 
        
        if (!token) {
          logout(); 
          navigate("/login");
          return;
        }
        
        const response = await api.get('/api/employee/earnings', { 
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        setJobSummary(response.data.jobSummary); // Set job summary
        setLoading(false);
        setError(null);
      } catch (err) {
        console.error("Error fetching job summary:", err);
        setError("Failed to load job summary. Please try again later.");
        setLoading(false);
        if (err.response?.status === 401 || err.response?.status === 403) {
          logout();
          navigate('/login');
        }
      }
    };
    
    fetchJobSummary();
  }, [navigate]);

  if (loading) {
    return <p className="text-center">Loading job summary...</p>;
  }

  if (error) {
    return <div className="status-message error">Error: {error}</div>;
  }

  return (
    <div className="card" style={{ maxWidth: 800, margin: "2rem auto" }}>
      <h3 style={{ marginBottom: "1.5rem", textAlign: "center", color: 'var(--color-text)' }}>Job Summary</h3>

      {/* Job Summary */}
      <h4 style={{ marginBottom: "1rem", color: 'var(--color-text)' }}>Job Overview</h4>
      <div className="grid-container mb-4">
        <div className="card text-center bg-light">
          <h5>Total Assigned</h5>
          <p className="text-2xl font-bold text-dark">{jobSummary.totalAssigned}</p>
        </div>
        <div className="card text-center bg-light">
          <h5>Completed</h5>
          <p className="text-2xl font-bold text-success">{jobSummary.completed}</p>
        </div>
        <div className="card text-center bg-light">
          <h5>In Progress</h5>
          <p className="text-2xl font-bold text-secondary">{jobSummary.inProgress}</p>
        </div>
        <div className="card text-center bg-light">
          <h5>Pending</h5>
          <p className="text-2xl font-bold text-warning">{jobSummary.pending}</p>
        </div>
        <div className="card text-center bg-light">
          <h5>Cancelled</h5>
          <p className="text-2xl font-bold text-error">{jobSummary.cancelled}</p>
        </div>
      </div>

      <p className="text-center text-light mt-4">
        Financial earnings and commission tracking have been removed from the application.
      </p>
    </div>
  );
}

export default EmployeeEarnings;
