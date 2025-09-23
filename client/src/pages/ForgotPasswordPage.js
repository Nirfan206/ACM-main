import React, { useState, useEffect } from 'react';
//import axios from 'axios';
import api from '../api';
import { Link } from 'react-router-dom';

function ForgotPasswordPage() {
  const [phone, setPhone] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!phone || !newPassword || !confirmPassword) {
      setError('All fields are required.');
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirm password do not match.');
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      setLoading(false);
      return;
    }

    try {
      // Directly call the password reset endpoint with phone and new password
      await axios.post('http://localhost:5000/api/auth/password-reset', { phone, newPassword });
      setSuccess('Password reset successful! You can now login with your new password.');
      setPhone('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.response?.data?.message || 'Password reset failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: {
      maxWidth: 400,
      margin: '3rem auto',
      backgroundColor: 'var(--card)',
      padding: '2rem',
      borderRadius: 'var(--radius)',
      boxShadow: 'var(--shadow)',
      fontFamily: 'var(--font-main)',
    },
    heading: {
      textAlign: 'center',
      marginBottom: '1.5rem',
      color: 'var(--color-primary)',
    },
    input: {
      width: '100%',
      padding: '10px',
      marginBottom: '12px',
      borderRadius: '6px',
      border: '1px solid var(--border)',
      fontSize: '14px',
      outline: 'none',
    },
    button: {
      width: '100%',
      padding: '10px',
      borderRadius: '6px',
      border: 'none',
      backgroundColor: 'var(--color-primary)',
      color: 'var(--color-white)',
      fontWeight: 'bold',
      cursor: 'pointer',
      fontSize: '15px',
      transition: 'background 0.3s',
    },
    buttonHover: {
      backgroundColor: 'var(--color-dark)',
    },
    messageError: {
      color: 'var(--color-error)',
      marginTop: '10px',
      textAlign: 'center',
      padding: '0.75rem',
      backgroundColor: `var(--color-error)15`,
      borderRadius: '6px',
      border: `1px solid var(--color-error)30`
    },
    messageSuccess: {
      color: 'var(--color-success)',
      marginTop: '10px',
      textAlign: 'center',
      padding: '0.75rem',
      backgroundColor: `var(--color-success)15`,
      borderRadius: '6px',
      border: `1px solid var(--color-success)30`
    },
    warningBox: {
      marginTop: '1.5rem',
      padding: '1rem',
      backgroundColor: `var(--color-accent)10`,
      borderRadius: '6px',
      fontSize: '0.85rem',
      border: `1px solid var(--color-accent)30`,
      color: 'var(--color-text)'
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Reset Password</h2>
      <form onSubmit={handleResetPassword}>
        <input
          type="text"
          placeholder="Enter Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          style={styles.input}
          disabled={loading}
        />
        <input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          style={styles.input}
          disabled={loading}
        />
        <input
          type="password"
          placeholder="Confirm New Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          style={styles.input}
          disabled={loading}
        />
        <button
          type="submit"
          style={styles.button}
          onMouseOver={(e) => (e.target.style.backgroundColor = styles.buttonHover.backgroundColor)}
          onMouseOut={(e) => (e.target.style.backgroundColor = styles.button.backgroundColor)}
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Reset Password'}
        </button>
      </form>
      {error && <div style={styles.messageError}>⚠️ {error}</div>}
      {success && <div style={styles.messageSuccess}>✅ {success}</div>}

      <div style={styles.warningBox}>
        <p style={{ margin: 0, fontWeight: 'bold', color: 'var(--color-accent)' }}>Important Security Note:</p>
        <p style={{ margin: '0.5rem 0 0 0' }}>
          This password reset mechanism directly updates your password using your phone number and a new password.
          For enhanced security, consider implementing an OTP (One-Time Password) verification flow.
        </p>
      </div>

      <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
        <Link 
          to="/login" 
          style={{ 
            color: 'var(--color-primary)', 
            textDecoration: 'none' 
          }}
        >
          Back to Login
        </Link>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
