import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api'; 
import { login } from '../utils/authUtils'; // --- 1. IMPORT THE CENTRAL LOGIN FUNCTION ---

function LoginPage() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  const themeColors = {
    primary: '#16a34a',
    secondary: '#0ea5e9',
    accent: '#f59e0b',
    light: '#f9fafb',
    dark: '#374151',
    text: '#374151',
    textLight: '#6b7280',
    success: '#10b981',
    error: '#ef4444',
  };

  useEffect(() => {
    const root = document.documentElement;
    Object.entries(themeColors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!phone || !password) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    try {
      const response = await api.post('/api/auth/login', {
        phone,
        password
      });

      const { token, user: { role: userRole } } = response.data;
      
      // --- 2. USE THE CENTRAL LOGIN FUNCTION ---
      // This replaces the three separate sessionStorage.setItem calls
      login(token, userRole);

      console.log('Login successful:', { role: userRole });

      switch (userRole) {
        case 'admin':
          navigate('/admin/users');
          break;
        case 'customer':
          navigate('/customer');
          break;
        case 'employee':
          navigate('/employee');
          break;
        case 'customercare':
          navigate('/customercare/requests');
          break;
        default:
          navigate('/');
      }
    } catch (err) {
      console.error('Login error:', err);
      if (err.response && err.response.data) {
        setError(err.response.data.message || 'Login failed. Please check your credentials.');
      } else {
        setError('Server connection failed. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      maxWidth: 420,
      margin: '2rem auto',
      padding: '2rem',
      border: `1px solid ${themeColors.light}`,
      borderRadius: '8px',
      boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
      backgroundColor: '#fff'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2 style={{ color: themeColors.primary, margin: 0 }}>🔐 Login</h2>
        <p style={{ color: themeColors.textLight, fontSize: '0.9rem', margin: '0.5rem 0 0 0' }}>
          AL CHAAN MEERA Service Portal
        </p>
        <p style={{ color: themeColors.textLight, fontSize: '0.8rem', margin: '0.3rem 0 0 0' }}>
          Enter your credentials to access the system
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '0.5rem', 
            color: themeColors.text,
            fontWeight: '500' 
          }}>
            📱 Mobile Number: <span style={{ color: themeColors.error }}>*</span>
          </label>
          <input
            type="tel"
            placeholder="Enter 10-digit mobile number"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            maxLength="10"
            required
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '6px',
              border: `1px solid ${themeColors.textLight}`,
              outline: 'none',
              fontSize: '14px',
              backgroundColor: loading ? '#f5f5f5' : 'white'
            }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '0.5rem', 
            color: themeColors.text,
            fontWeight: '500' 
          }}>
            🔑 Password: <span style={{ color: themeColors.error }}>*</span>
          </label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '6px',
              border: `1px solid ${themeColors.textLight}`,
              outline: 'none',
              fontSize: '14px',
              backgroundColor: loading ? '#f5f5f5' : 'white'
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading || !phone || !password}
          style={{
            width: '100%',
            padding: '0.75rem',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: (loading || !phone || !password) ? themeColors.textLight : themeColors.primary,
            color: 'white',
            fontWeight: 'bold',
            fontSize: '16px',
            cursor: (loading || !phone || !password) ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.3s'
          }}
        >
          {loading ? '⏳ Authenticating...' : '🚀 Login to System'}
        </button>
      </form>

      {error && (
        <div style={{ 
          color: themeColors.error, 
          marginTop: '1rem', 
          textAlign: 'center',
          padding: '0.75rem',
          backgroundColor: `rgba(239, 68, 68, 0.1)`,
          borderRadius: '6px',
          border: `1px solid rgba(239, 68, 68, 0.3)`
        }}>
          ⚠️ {error}
        </div>
      )}

      <div style={{ 
        marginTop: '1.5rem', 
        padding: '1rem',
        backgroundColor: `rgba(14, 165, 233, 0.1)`,
        borderRadius: '6px',
        fontSize: '0.85rem',
        border: `1px solid rgba(14, 165, 233, 0.3)`
      }}>
        <div style={{ 
          fontWeight: 'bold', 
          color: themeColors.secondary, 
          marginBottom: '0.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          ℹ️ Login Information:
        </div>
        <div style={{ lineHeight: '1.6', color: themeColors.text }}>
          • All three fields are required for login<br/>
          • Mobile number must be registered in the system<br/>
          • Role must match your account type<br/>
          • Contact administrator if you don't have an account
        </div>
      </div>

      <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
        <Link 
          to="/register" 
          style={{ 
            color: themeColors.primary, 
            textDecoration: 'none',
            marginRight: '1rem'
          }}
        >
          📝 Register New Account
        </Link>
        <Link 
          to="/forgot-password" 
          style={{ 
            color: themeColors.primary, 
            textDecoration: 'none' 
          }}
        >
          🔑 Forgot Password?
        </Link>
      </div>

      <div style={{ 
        marginTop: '1rem', 
        textAlign: 'center', 
        fontSize: '0.8rem', 
        color: themeColors.textLight,
        backgroundColor: `rgba(249, 250, 251, 0.8)`,
        padding: '0.5rem',
        borderRadius: '4px'
      }}>
        🗄️ Login credentials are validated against the database
      </div>
    </div>
  );
}

export default LoginPage;
