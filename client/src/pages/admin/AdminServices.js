import React, { useEffect, useState } from "react";
import api from "../../api";

function AdminServices() {
  const [services, setServices] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [form, setForm] = useState({ type: "", description: "", category: "" });
  const [loading, setLoading] = useState(true);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");

  useEffect(() => {
    fetchServices();
  }, []);

  // Fetch all services
  async function fetchServices() {
    try {
      setLoading(true);
      setSubmitError("");
      const token = sessionStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const { data } = await api.get("/api/services", { headers });
      setServices(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching services:", err);
      setSubmitError(err.response?.data?.message || "Failed to load services.");
    } finally {
      setLoading(false);
    }
  }

  function openModal(service = null) {
    setSubmitError("");
    setSubmitSuccess("");
    if (service) {
      setEditingService(service);
      setForm({
        type: service.type || "",
        description: service.description || "",
        category: service.category || ""
      });
    } else {
      setEditingService(null);
      setForm({ type: "", description: "", category: "" });
    }
    setShowModal(true);
  }

  // Save or update service
  async function saveService(e) {
    if (e?.preventDefault) e.preventDefault();
    setSubmitError("");
    setSubmitSuccess("");

    // Validation
    if (!form.type.trim()) return setSubmitError("Service Type is required");
    if (!form.category.trim()) return setSubmitError("Category is required");

    const token = sessionStorage.getItem("token");
    if (!token) return setSubmitError("Authentication required.");

    const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
    const serviceData = {
      type: form.type.trim(),
      description: form.description.trim(),
      category: form.category.trim()
    };

    try {
      let res;
      if (editingService) {
        res = await api.put(`/api/services/${editingService._id}`, serviceData, { headers });
        setServices((prev) =>
          prev.map((s) => (s._id === editingService._id ? { ...s, ...serviceData } : s))
        );
        setSubmitSuccess("Service updated successfully");
      } else {
        res = await api.post("/api/services", serviceData, { headers });
        const created = res.data;
        setSubmitSuccess("Service created successfully");
        if (created && created._id) setServices((prev) => [created, ...prev]);
        else await fetchServices();
      }

      setShowModal(false);
      setTimeout(() => setSubmitSuccess(""), 3000);
    } catch (err) {
      console.error("Error saving service:", err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.msg ||
        "Failed to save service. Check input fields.";
      setSubmitError(msg);
    }
  }

  // Delete a service
  async function deleteService(id) {
    if (!window.confirm("Are you sure you want to delete this service?")) return;
    setSubmitError("");
    setSubmitSuccess("");

    const token = sessionStorage.getItem("token");
    if (!token) return setSubmitError("Authentication required.");

    try {
      await api.delete(`/api/services/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setServices((prev) => prev.filter((s) => s._id !== id));
      setSubmitSuccess("Service deleted successfully");
      setTimeout(() => setSubmitSuccess(""), 3000);
    } catch (err) {
      console.error("Delete failed", err);
      setSubmitError(err.response?.data?.message || "Failed to delete service.");
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  if (loading) return <p className="text-center">Loading services...</p>;

  return (
    <div className="admin-page-container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 className="page-title">Service Management</h2>
        <button onClick={fetchServices} className="btn btn-outline">
          Refresh
        </button>
      </div>

      {submitError && <div className="status-message error">{submitError}</div>}
      {submitSuccess && <div className="status-message success">{submitSuccess}</div>}

      <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: "1rem" }}>
        <button onClick={() => openModal()} className="btn btn-accent">
          ➕ Add New Service
        </button>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>Type</th>
            <th>Description</th>
            <th>Category</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {services.length === 0 ? (
            <tr>
              <td colSpan="5" className="text-center">
                No services found.
              </td>
            </tr>
          ) : (
            services.map((service) => (
              <tr key={service._id}>
                <td>{service.type}</td>
                <td>{service.description}</td>
                <td>{service.category}</td>
                <td>
                  <span
                    className={`status-badge ${
                      service.status === "active" ? "status-success" : "status-error"
                    }`}
                  >
                    {service.status || "inactive"}
                  </span>
                </td>
                <td>
                  <button onClick={() => openModal(service)} className="btn btn-secondary btn-sm">
                    Edit
                  </button>
                  <button
                    onClick={() => deleteService(service._id)}
                    className="btn btn-danger btn-sm"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title">{editingService ? "Edit Service" : "Add New Service"}</h3>

            <form onSubmit={saveService}>
              <div className="form-group">
                <label>Service Type:</label>
                <input
                  name="type"
                  type="text"
                  value={form.type}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
              </div>

              <div className="form-group">
                <label>Description:</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label>Category:</label>
                <input
                  name="category"
                  type="text"
                  value={form.category}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={!form.type.trim() || !form.category.trim()}
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminServices;
