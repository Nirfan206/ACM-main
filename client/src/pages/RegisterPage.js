import React, { useState, useEffect } from "react";
import api from '../api';
import { useNavigate, Link } from "react-router-dom";

function RegisterPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [location, setLocation] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (!name || !phone || !password) {
      setError("Please fill all required fields");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (location === "Other") {
      setError("Registration not available for this district.");
      setLoading(false);
      return;
    }

    try {
      const registerRes = await api.post("/api/auth/register", {
        name,
        phone,
        password,
      });

      if (registerRes.status === 201) {
        sessionStorage.setItem("token", registerRes.data.token);
        if (registerRes.data.user.role) {
          sessionStorage.setItem("role", registerRes.data.user.role);
        }

        setSuccess("Registration successful! 🎉");
        setTimeout(() => navigate("/customer/profile"), 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "40px auto", padding: 24, border: `1px solid var(--border)`, borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)', backgroundColor: 'var(--card)' }}>
      <h2 style={{ textAlign: "center", marginBottom: 16, color: 'var(--color-primary)' }}>Register</h2>
      <form onSubmit={handleRegister}>
        <input 
          type="text" 
          placeholder="Name *" 
          value={name} 
          onChange={e => setName(e.target.value)} 
          style={{ width: "100%", marginBottom: 12, padding: 8, border: `1px solid var(--border)`, borderRadius: '4px' }} 
          required 
        />
        <input 
          type="tel" 
          placeholder="Phone Number *" 
          value={phone} 
          onChange={e => setPhone(e.target.value)} 
          pattern="[0-9]{10}" 
          title="Enter a 10-digit phone number"
          style={{ width: "100%", marginBottom: 12, padding: 8, border: `1px solid var(--border)`, borderRadius: '4px' }} 
          required 
        />
        <input 
          type="password" 
          placeholder="Password *" 
          value={password} 
          onChange={e => setPassword(e.target.value)} 
          style={{ width: "100%", marginBottom: 12, padding: 8, border: `1px solid var(--border)`, borderRadius: '4px' }} 
          required 
        />
        <input 
          type="password" 
          placeholder="Confirm Password *" 
          value={confirmPassword} 
          onChange={e => setConfirmPassword(e.target.value)} 
          style={{ width: "100%", marginBottom: 12, padding: 8, border: `1px solid var(--border)`, borderRadius: '4px' }} 
          required 
        />
        <select 
          value={location} 
          onChange={e => setLocation(e.target.value)} 
          style={{ width: "100%", marginBottom: 12, padding: 8, border: `1px solid var(--border)`, borderRadius: '4px' }}
          required
        >
          <option value="">Select District</option>
          <option value="Guntur">Guntur</option>
          <option value="Prakasam">Prakasam</option>
          <option value="Palanadu">Palanadu</option>
          <option value="Other">Other District</option>
        </select>

        {location === "Other" && (
          <div style={{ color: "var(--color-error)", marginBottom: 12 }}>
            Service available only in Guntur, Prakasam & Palanadu.  
            Please call our Customer Care directly at <b>+91-9966972228</b> or <b>+91-6305320364</b>.
          </div>
        )}

        <button 
          type="submit" 
          style={{
            width: "100%",
            padding: 10,
            background: 'var(--color-accent)',
            color: 'var(--color-white)',
            border: "none",
            borderRadius: 4,
            cursor: loading || location === "Other" ? "not-allowed" : "pointer",
            opacity: loading || location === "Other" ? 0.7 : 1
          }}
          disabled={loading || location === "Other"}
        >
          {loading ? "Processing..." : "Register"}
        </button>
      </form>

      {error && <div style={{ color: 'var(--color-error)', marginTop: 12 }}>{error}</div>}
      {success && <div style={{ color: 'var(--color-success)', marginTop: 12 }}>{success}</div>}
      
      <div style={{ marginTop: 20, textAlign: "center" }}>
        <p style={{ color: 'var(--color-text)' }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: "bold", textDecoration: "none" }}>
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
