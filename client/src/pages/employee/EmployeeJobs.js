import React, { useState, useEffect, useRef } from "react";
import api from '../../api';

function EmployeeJobs() {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [statusUpdate, setStatusUpdate] = useState("");
  const [notesUpdate, setNotesUpdate] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('token');
      
      if (!token) {
        setError("Authentication required. Please log in.");
        setLoading(false);
        return;
      }
      
      const response = await api.get('/api/employee/jobs', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setJobs(response.data);
      setLoading(false);
      setError(null);
    } catch (err) {
      console.error("Error fetching jobs:", err);
      setError("Failed to load jobs. Please try again later.");
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchJobs(); // Initial fetch

    const intervalId = setInterval(fetchJobs, 5000); // Poll every 5 seconds

    return () => clearInterval(intervalId); // Clean up interval on component unmount
  }, []);

  const handleStatusChange = async (jobId) => {
    if (!statusUpdate) return;
    
    try {
      const token = sessionStorage.getItem('token');
      
      if (!token) {
        setError("Authentication required. Please log in.");
        return;
      }
      
      await api.put(`/api/employee/jobs/${jobId}`, 
        { status: statusUpdate, notes: notesUpdate.trim() },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      const updatedJobs = jobs.map((job) =>
        job._id === jobId ? { ...job, status: statusUpdate, notes: notesUpdate.trim() } : job
      );
      
      setJobs(updatedJobs);
      setSelectedJob(null);
      setStatusUpdate("");
      setNotesUpdate("");
      setSuccess("Job status updated successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error updating job status:", err);
      setError(err.response?.data?.message || "Failed to update job status. Please try again.");
      setTimeout(() => setError(null), 3000);
    }
  };

  if (loading) {
    return <p className="text-center">Loading jobs...</p>;
  }

  if (error) {
    return <div className="status-message error">Error: {error}</div>;
  }

  return (
    <div className="card" style={{ maxWidth: 800, margin: "2rem auto" }}>
      <h3 style={{ marginBottom: "1.5rem", textAlign: "center", color: 'var(--color-text)' }}>Assigned Jobs</h3>

      {success && (
        <div className="status-message success">
          {success}
        </div>
      )}
      {error && (
        <div className="status-message error">
          {error}
        </div>
      )}

      <div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Service</th>
              <th>Date</th>
              <th>Status</th>
              <th>Notes</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {jobs.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center">No jobs assigned to you.</td>
              </tr>
            ) : (
              jobs.map((job) => (
                <tr key={job._id}>
                  <td>
                    {job.user?.profile?.name || 'N/A'}
                    <br />
                    <a href={`tel:${job.user?.phone}`} style={{ textDecoration: 'none', color: 'var(--color-secondary)' }}>
                      {job.user?.phone || 'N/A'}
                    </a>
                    <br />
                    <small>{job.user?.profile?.address || 'N/A'}</small>
                  </td>
                  <td>{job.service?.type || 'N/A'}</td>
                  <td>{new Date(job.date).toLocaleDateString()}</td>
                  <td>
                    <span className={`status-badge status-${job.status.toLowerCase().replace(' ', '-').replace('awaiting-admin-confirmation', 'pending')}`}>
                      {job.status.replace(' - ', ' ').replace('awaiting admin confirmation', 'Awaiting Admin')}
                    </span>
                  </td>
                  <td>{job.notes || 'N/A'}</td>
                  <td>
                    <button
                      onClick={() => {
                        setSelectedJob(job);
                        setStatusUpdate(job.status === 'Completed - Awaiting Admin Confirmation' ? 'Completed' : job.status);
                        setNotesUpdate(job.notes || "");
                      }}
                      className="btn btn-secondary btn-sm"
                    >
                      Update Status
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedJob && (
        <div className="card" style={{ marginTop: "20px" }}>
          <h4 style={{ marginBottom: "1rem", color: 'var(--color-text)' }}>Update Job Status</h4>
          <p>
            <strong>Customer:</strong> {selectedJob.user?.profile?.name || 'N/A'}
          </p>
          <p>
            <strong>Phone:</strong> <a href={`tel:${selectedJob.user?.phone}`} style={{ textDecoration: 'none', color: 'var(--color-secondary)' }}>{selectedJob.user?.phone || 'N/A'}</a>
          </p>
          <p>
            <strong>Address:</strong> {selectedJob.user?.profile?.address || 'N/A'}
          </p>
          <p style={{ marginBottom: "1rem" }}>
            <strong>Service:</strong> {selectedJob.service?.type || 'N/A'}
          </p>

          <div className="form-group">
            <label>Status:</label>
            <select
              value={statusUpdate}
              onChange={(e) => setStatusUpdate(e.target.value)}
              className="form-control"
            >
              <option value="">Select Status</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Pending - Weather">Pending - Weather</option>
              <option value="Pending - Customer Unavailable">Pending - Customer Unavailable</option>
              <option value="Pending - Technical">Pending - Technical</option>
            </select>
          </div>

          <div className="form-group">
            <label>Notes (e.g., reason for pending/cancellation):</label>
            <textarea
              value={notesUpdate}
              onChange={(e) => setNotesUpdate(e.target.value)}
              placeholder="Add any relevant notes or reasons for status change..."
              rows="3"
              className="form-control"
            ></textarea>
          </div>

          <div className="form-actions-group">
            <button
              onClick={() => handleStatusChange(selectedJob._id)}
              disabled={!statusUpdate || (statusUpdate === selectedJob.status && notesUpdate === (selectedJob.notes || ""))}
              className="btn btn-success"
            >
              Update
            </button>
            <button
              onClick={() => setSelectedJob(null)}
              className="btn btn-danger"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default EmployeeJobs;
