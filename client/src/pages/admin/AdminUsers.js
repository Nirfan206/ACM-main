import React, { useEffect, useState } from "react";
import api from "../../api";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState("customer");
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "customer",
    address: ""
  });
  const [loading, setLoading] = useState(true);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const locations = [
    "Guntur", "Prakasam", "Krishna", "Vijayawada", "Nellore",
    "Ongole", "Tenali", "Narasaraopet"
  ];

  const roleDisplayMap = {
    customer: "Customer",
    employee: "Employee",
    customercare: "Customer Care",
    admin: "Admin"
  };
  const roles = Object.keys(roleDisplayMap);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setSubmitError("");

      const token = sessionStorage.getItem("token");
      if (!token) {
        setSubmitError("Authentication required. Please log in.");
        setLoading(false);
        return;
      }

      const { data } = await api.get("/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(data || []);
    } catch (err) {
      console.error("Fetch failed", err);
      setSubmitError(err.response?.data?.message || "Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openModal = (user = null) => {
    setSubmitError("");
    setSubmitSuccess("");

    if (user) {
      setEditingUser(user);
      setForm({
        name: user.profile?.name || "",
        email: user.profile?.email || "",
        phone: user.phone || "",
        password: "",
        role: user.role || "customer",
        address: user.profile?.address || ""
      });
    } else {
      setEditingUser(null);
      setForm({
        name: "", email: "", phone: "", password: "", role: activeTab, address: ""
      });
    }
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const saveUser = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    setSubmitError("");
    setSubmitSuccess("");

    try {
      if (!form.name.trim() || !form.phone.trim()) {
        setSubmitError("Name and Phone are required");
        return;
      }
      if (!/^\d{10}$/.test(form.phone.trim())) {
        setSubmitError("Phone number must be a 10-digit number");
        return;
      }
      if (!editingUser && !form.password.trim()) {
        setSubmitError("Password is required for new users");
        return;
      }
      if (form.password.trim() && form.password.trim().length < 6) {
        setSubmitError("Password must be at least 6 characters long");
        return;
      }
      if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
        setSubmitError("Invalid email format");
        return;
      }

      const token = sessionStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const userData = {
        phone: form.phone.trim(),
        role: form.role,
        profile: {
          name: form.name.trim(),
          email: form.email.trim() || "",
          address: form.address.trim() || ""
        }
      };
      if (form.password.trim()) userData.password = form.password.trim();

      if (editingUser) {
        await api.put(`/api/admin/users/${editingUser._id}`, userData, { headers });
        setSubmitSuccess("User updated successfully");
      } else {
        await api.post("/api/admin/users", userData, { headers });
        setSubmitSuccess("User created successfully");
      }
      
      setShowModal(false);
      await fetchUsers(); // Always refetch after saving for consistency
      setTimeout(() => setSubmitSuccess(""), 3000);

    } catch (error) {
      console.error("Error saving user:", error);
      setSubmitError(error.response?.data?.message || "Failed to save user.");
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    setSubmitError("");
    setSubmitSuccess("");

    try {
      const token = sessionStorage.getItem("token");
      await api.delete(`/api/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setUsers((prev) => prev.filter((u) => u._id !== id));
      setSubmitSuccess("User deleted successfully");
      setTimeout(() => setSubmitSuccess(""), 3000);
    } catch (err) {
      console.error("Delete failed", err);
      setSubmitError(err.response?.data?.message || "Error deleting user.");
    }
  };

  if (loading) return <p className="text-center">Loading users...</p>;

  const filteredUsers = users.filter(
    (u) =>
      u.role === activeTab &&
      (
        (u.profile?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.phone || "").includes(searchTerm) ||
        (u.profile?.email || "").toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  return (
    <div className="admin-page-container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 className="page-title">User Management</h2>
        <button onClick={fetchUsers} className="btn btn-outline">Refresh</button>
      </div>

      {submitError && <div className="status-message error">{submitError}</div>}
      {submitSuccess && <div className="status-message success">{submitSuccess}</div>}

      <div className="form-group" style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Search by name, phone, or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="form-control"
        />
      </div>

      <div className="tab-nav">
        {roles.map((r) => (
          <button
            key={r}
            onClick={() => setActiveTab(r)}
            className={`tab-button ${activeTab === r ? "active" : ""}`}
          >
            {roleDisplayMap[r]}s ({users.filter((u) => u.role === r).length})
          </button>
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: "1rem" }}>
        <button onClick={() => openModal()} className="btn btn-accent">
          ➕ Add {roleDisplayMap[activeTab]}
        </button>
      </div>

      <div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              {(activeTab === "employee" || activeTab === "customer") && <th>Address</th>}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((u) => (
              <tr key={u._id}>
                <td>{u.profile?.name || "N/A"}</td>
                <td>{u.profile?.email || "N/A"}</td>
                <td>{u.phone || "N/A"}</td>
                {(activeTab === "employee" || activeTab === "customer") && (
                  <td>{u.profile?.address || "N/A"}</td>
                )}
                <td>
                  <button onClick={() => openModal(u)} className="btn btn-secondary btn-sm">
                    Edit
                  </button>
                  <button onClick={() => deleteUser(u._id)} className="btn btn-danger btn-sm">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={activeTab === "employee" || activeTab === "customer" ? 5 : 4} className="text-center">
                  No {roleDisplayMap[activeTab].toLowerCase()}s found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title">
              {editingUser ? "Edit User" : `Add New ${roleDisplayMap[activeTab]}`}
            </h3>

            <form onSubmit={saveUser}>
              <div className="form-group">
                <label>Name:</label>
                <input
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
              </div>

              <div className="form-group">
                <label>Email:</label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label>Phone:</label>
                <input
                  name="phone"
                  type="text"
                  value={form.phone}
                  onChange={handleChange}
                  className="form-control"
                  required
                  placeholder="10-digit number"
                />
              </div>

              <div className="form-group">
                <label>Password {editingUser && "(leave blank to keep current)"}:</label>
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  className="form-control"
                  required={!editingUser}
                />
              </div>

              <div className="form-group">
                <label>Role:</label>
                <select name="role" value={form.role} onChange={handleChange} className="form-control">
                  {roles.map((role) => (
                    <option key={role} value={role}>
                      {roleDisplayMap[role]}
                    </option>
                  ))}
                </select>
              </div>

              {(form.role === "employee" || form.role === "customer") && (
                <div className="form-group">
                  <label>{form.role === "employee" ? "Work Address:" : "Address:"}</label>
                  {form.role === "employee" ? (
                    <select name="address" value={form.address} onChange={handleChange} className="form-control">
                      <option value="">Select Location</option>
                      {locations.map((loc) => (
                        <option key={loc} value={loc}>
                          {loc}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <textarea
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      className="form-control"
                    />
                  )}
                </div>
              )}

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

export default AdminUsers;
