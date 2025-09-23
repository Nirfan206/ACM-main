import React, { useEffect, useState } from "react";
import api from "../../api";
import { useNavigate } from "react-router-dom";

function CareEmployeeAvailability() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const fetchEmployeeStatuses = async () => {
    try {
      setLoading(true);
      setError("");

      const token = sessionStorage.getItem("token");
      if (!token) {
        navigate("/login", { replace: true });
        return;
      }

      // Reusing the admin endpoint for employee statuses
      const res = await api.get("/api/admin/employees/status", {
        headers: { Authorization: `Bearer ${token}` }
      });

      setEmployees(res.data || []);
    } catch (err) {
      console.error("Error fetching employee statuses:", err);
      setError(err.response?.data?.message || "Failed to load employee availability.");
      const s = err.response?.status;
      if (s === 401 || s === 403) {
        navigate("/login", { replace: true });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch only; removed 5s polling to avoid auto reload behavior
    fetchEmployeeStatuses();
  }, [navigate]);

  if (loading) {
    return (
      <div className="text-center p-8">
        <p>Loading employee availability...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 status-message error">
        <p>Error: {error}</p>
        <button onClick={fetchEmployeeStatuses} className="btn btn-outline" style={{ marginTop: 12 }}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="card admin-page-container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 className="card-title text-center">🧑‍🔧 Employee Availability Dashboard</h3>
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
            {employees.map((employee) => (
              <tr key={employee._id}>
                <td>{employee.profile?.name || "N/A"}</td>
                <td>{employee.phone || "N/A"}</td>
                <td>
                  <span
                    className={`status-badge ${
                      employee.workingStatus === "free" ? "status-warning" : "status-success"
                    }`}
                  >
                    {employee.workingStatus?.toUpperCase() || "N/A"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default CareEmployeeAvailability;
