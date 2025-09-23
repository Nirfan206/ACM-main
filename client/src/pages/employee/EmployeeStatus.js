import React, { useEffect, useState } from "react";
import api from "../../api";
import { useNavigate } from "react-router-dom";
import { getUserRole, logout } from "../../utils/authUtils";

function EmployeeStatus() {
  const [workingStatus, setWorkingStatus] = useState("free"); // 'free' | 'working'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();
  const currentUserRole = getUserRole();

  const fetchWorkingStatus = async () => {
    try {
      setLoading(true);
      setError("");

      const token = sessionStorage.getItem("token");
      if (!token) {
        logout();
        navigate("/login", { replace: true });
        return;
      }

      const res = await api.get("/api/employee/status", {
        headers: { Authorization: `Bearer ${token}` }
      });

      const newStatus = res.data?.workingStatus || "free";
      setWorkingStatus(newStatus);
    } catch (err) {
      console.error("Error fetching working status:", err);
      setError(err.response?.data?.message || "Failed to load working status.");
      const s = err.response?.status;
      if (s === 401 || s === 403) {
        logout();
        navigate("/login", { replace: true });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch only; removed setInterval polling
    fetchWorkingStatus();
  }, [navigate]);

  const setEmployeeStatus = async (desired) => {
    try {
      setError("");
      setSuccess("");

      const token = sessionStorage.getItem("token");
      if (!token) {
        setError("Authentication required. Please log in.");
        logout();
        navigate("/login", { replace: true });
        return;
      }

      if (desired === workingStatus) {
        setSuccess(`Status is already ${desired.toUpperCase()}.`);
        setTimeout(() => setSuccess(""), 3000);
        return;
      }

      // Toggle API call
      const res = await api.put(
        "/api/employee/status/toggle",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const newWorkingStatus = res.data?.workingStatus;
      if (newWorkingStatus) {
        setWorkingStatus(newWorkingStatus);
        setSuccess(`Status updated to: ${newWorkingStatus.toUpperCase()}!`);
      } else {
        setSuccess("Status updated, but new status value was unexpected.");
      }
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Error setting working status:", err);
      setError(err.response?.data?.message || "Failed to update working status.");
      const s = err.response?.status;
      if (s === 401 || s === 403) {
        logout();
        navigate("/login", { replace: true });
      }
      setTimeout(() => setError(""), 3000);
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 className="card-title" style={{ color: "var(--color-secondary)" }}>My Status</h3>
        <button onClick={fetchWorkingStatus} className="btn btn-outline">Refresh</button>
      </div>

      <p className="text-center text-light">
        Logged in as:{" "}
        <span className="font-bold" style={{ color: "var(--color-accent)" }}>
          {currentUserRole?.toUpperCase() || "N/A"}
        </span>
      </p>

      {error && <div className="status-message error">{error}</div>}
      {success && <div className="status-message success">{success}</div>}

      <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
        <p style={{ fontSize: "1.1rem", color: "var(--color-text)" }}>Current Working Status:</p>
        <span
          className={`status-badge ${
            workingStatus === "free" ? "status-warning" : "status-success"
          }`}
          style={{
            fontSize: "1.2rem",
            padding: "8px 15px",
            color: workingStatus === "free" ? "var(--color-dark)" : "var(--color-white)"
          }}
        >
          {workingStatus?.toUpperCase() || "N/A"}
        </span>
      </div>

      <div style={{ textAlign: "center", display: "flex", justifyContent: "center", gap: "1rem" }}>
        <button
          onClick={() => setEmployeeStatus("free")}
          className={`btn ${workingStatus === "free" ? "btn-warning" : "btn-outline"}`}
          disabled={workingStatus === "free"}
        >
          Set Free
        </button>
        <button
          onClick={() => setEmployeeStatus("working")}
          className={`btn ${workingStatus === "working" ? "btn-primary" : "btn-outline"}`}
          disabled={workingStatus === "working"}
        >
          Set Working
        </button>
      </div>

      <div style={{ marginTop: "2rem", borderTop: "1px solid var(--border)", paddingTop: "1rem" }}>
        <h4 style={{ textAlign: "center", marginBottom: "1rem", color: "var(--color-text)" }}>
          Current Assignment:
        </h4>
        <p style={{ textAlign: "center", color: "var(--color-textLight)" }}>No current assignment.</p>
      </div>
    </div>
  );
}

export default EmployeeStatus;
