import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import { logout } from '../../utils/authUtils'; // Import logout utility

function EmployeeEarnings() {
  const [earnings, setEarnings] = useState([]);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [commission, setCommission] = useState(0);
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

  // Fetch earnings data from API
  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        setLoading(true);
        const token = sessionStorage.getItem('token'); // Changed from localStorage
        
        if (!token) {
          logout(); // Use utility for logout
          navigate("/login");
          return;
        }
        
        const response = await axios.get('http://localhost:5000/api/employee/earnings', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        setEarnings(response.data.earningsDetails);
        setTotalEarnings(response.data.totalEarnings);
        setCommission(response.data.commission);
        setJobSummary(response.data.jobSummary); // Set job summary
        setLoading(false);
        setError(null);
      } catch (err) {
        console.error("Error fetching earnings:", err);
        setError("Failed to load earnings. Please try again later.");
        setLoading(false);
        if (err.response?.status === 401 || err.response?.status === 403) {
          logout();
          navigate('/login');
        }
      }
    };
    
    fetchEarnings();
  }, [navigate]);

  if (loading) {
    return <p className="text-center">Loading earnings...</p>;
  }

  if (error) {
    return <div className="status-message error">Error: {error}</div>;
  }

  return (
    <div className="card" style={{ maxWidth: 800, margin: "2rem auto" }}>
      <h3 style={{ marginBottom: "1.5rem", textAlign: "center", color: 'var(--color-text)' }}>Earnings & Job Summary</h3>

      {/* Summary */}
      <div className="grid-container mb-4">
        <div className="card text-center bg-light">
          <h4>Total Earnings</h4>
          <p className="text-2xl font-bold text-secondary">
            ₹{totalEarnings.toFixed(2)}
          </p>
        </div>
        <div className="card text-center bg-light">
          <h4>Commission (10%)</h4>
          <p className="text-2xl font-bold text-primary">
            ₹{commission.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Job Summary */}
      <h4 style={{ marginBottom: "1rem", color: 'var(--color-text)' }}>Job Overview</h4>
      <div className="grid-container mb-4">
        <div className="card text-center bg-light">
          <h5>Total Assigned</h5>
          <p className="text-xl font-bold text-dark">{jobSummary.totalAssigned}</p>
        </div>
        <div className="card text-center bg-light">
          <h5>Completed</h5>
          <p className="text-xl font-bold text-success">{jobSummary.completed}</p>
        </div>
        <div className="card text-center bg-light">
          <h5>In Progress</h5>
          <p className="text-xl font-bold text-secondary">{jobSummary.inProgress}</p>
        </div>
        <div className="card text-center bg-light">
          <h5>Pending</h5>
          <p className="text-xl font-bold text-warning">{jobSummary.pending}</p>
        </div>
        <div className="card text-center bg-light">
          <h5>Cancelled</h5>
          <p className="text-xl font-bold text-error">{jobSummary.cancelled}</p>
        </div>
      </div>

      {/* Earnings Table */}
      <h4 style={{ marginBottom: "1rem", color: 'var(--color-text)' }}>Earnings Details (Completed Jobs)</h4>
      {earnings.length === 0 ? (
        <p className="text-center">No completed jobs with earnings found.</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Job</th>
              <th>Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            {earnings.map((e) => (
              <tr key={e.id}>
                <td>{new Date(e.date).toLocaleDateString()}</td>
                <td>{e.job}</td>
                <td>₹{e.amount.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default EmployeeEarnings;