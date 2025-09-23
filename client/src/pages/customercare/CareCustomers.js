import React, { useEffect, useState } from "react";
import api from "../../api";

function CareCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    password: ""
  });

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError("");

      const token = sessionStorage.getItem("token");
      if (!token) {
        setError("Authentication required. Please log in.");
        setLoading(false);
        return;
      }

      const res = await api.get("/api/customercare/customers", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCustomers(res.data || []);
    } catch (err) {
      console.error("Error fetching customers:", err);
      setError(err.response?.data?.message || "Failed to load customers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch only; no intervals or auto reloads
    fetchCustomers();
  }, []);

  const openModal = (customer = null) => {
    setError("");
    setSuccess("");
    if (customer) {
      setEditingCustomer(customer);
      setForm({
        name: customer.profile?.name || "",
        phone: customer.phone || "",
        email: customer.profile?.email || "",
        address: customer.profile?.address || "",
        password: "" // never prefill password
      });
    } else {
      setEditingCustomer(null);
      setForm({ name: "", phone: "", email: "", address: "", password: "" });
    }
    setShowModal(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const saveCustomer = async (e) => {
    e.preventDefault(); // prevent page refresh on submit
    setError("");
    setSuccess("");

    try {
      // client-side validation
      if (!form.name.trim() || !form.phone.trim()) {
        setError("Name and Phone are required.");
        return;
      }
      if (!/^\d{10}$/.test(form.phone.trim())) {
        setError("Phone number must be a 10-digit number.");
        return;
      }
      if (!editingCustomer && !form.password.trim()) {
        setError("Password is required for new customers.");
        return;
      }
      if (form.password.trim() && form.password.trim().length < 6) {
        setError("Password must be at least 6 characters long.");
        return;
      }
      if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
        setError("Invalid email format.");
        return;
      }

      const token = sessionStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const customerData = {
        phone: form.phone.trim(),
        profile: {
          name: form.name.trim(),
          email: form.email.trim(),
          address: form.address.trim()
        }
      };
      if (form.password.trim()) {
        customerData.password = form.password.trim();
      }

      if (editingCustomer) {
        await api.put(`/api/customercare/customers/${editingCustomer._id}`, customerData, { headers });
        setSuccess("Customer updated successfully!");
      } else {
        await api.post("/api/customercare/customers", customerData, { headers });
        setSuccess("Customer created successfully!");
      }

      setShowModal(false);
      await fetchCustomers(); // refresh list without page reload
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Error saving customer:", err);
      setError(err.response?.data?.message || "Failed to save customer.");
    }
  };

  return (
    <div className="admin-page-container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 className="page-title">Manage Customers</h2>
        <button onClick={fetchCustomers} className="btn btn-outline">Refresh</button>
      </div>

      {error && <div className="status-message error">{error}</div>}
      {success && <div className="status-message success">{success}</div>}

      <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: "1rem" }}>
        <button onClick={() => openModal()} className="btn btn-accent">
          ➕ Add New Customer
        </button>
      </div>

      <div>
        {loading ? (
          <p className="text-center">Loading customers...</p>
        ) : customers.length === 0 ? (
          <p className="text-center">No customers found.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Address</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer._id}>
                  <td>{customer.profile?.name || "N/A"}</td>
                  <td>{customer.phone || "N/A"}</td>
                  <td>{customer.profile?.email || "N/A"}</td>
                  <td>{customer.profile?.address || "N/A"}</td>
                  <td>
                    <button onClick={() => openModal(customer)} className="btn btn-secondary btn-sm">
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title">{editingCustomer ? "Edit Customer" : "Add New Customer"}</h3>

            <form onSubmit={saveCustomer}>
              <div className="form-group">
                <label>Name:</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleFormChange}
                  className="form-control"
                  required
                />
              </div>

              <div className="form-group">
                <label>Phone:</label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleFormChange}
                  className="form-control"
                  required
                />
              </div>

              <div className="form-group">
                <label>Email:</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleFormChange}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label>Address:</label>
                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleFormChange}
                  className="form-control"
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>
                  Password {editingCustomer && "(leave blank to keep current)"}:
                </label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleFormChange}
                  className="form-control"
                  required={!editingCustomer}
                />
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-outline">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
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

export default CareCustomers;
