import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios'; // Added this import

function LoginPage() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(''); // This state is no longer strictly needed for login logic, but kept for now
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  // Theme colors
  const themeColors = {
    primary: '#16a34a',    // Green
    secondary: '#0ea5e9',  // Blue
    accent: '#f59e0b',     // Amber
    light: '#f9fafb',      // Light gray
    dark: '#374151',       // Dark gray
    text: '#374151',       // Text color
    textLight: '#6b7280',  // Light text
    success: '#10b981',    // Success green
    error: '#ef4444',      // Error red
  };

  // Apply theme colors as CSS variables
  useEffect(() => {
    const root = document.documentElement;
    Object.entries(themeColors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });
  }, []);

  // NO MORE DEFAULT USERS - Only get from database/localStorage
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate all fields
    if (!phone || !password) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    try {
      // Make API call to login endpoint
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        phone,
        password
      });

      // Get token and user info from response
      const { token, user: { role: userRole } } = response.data; // Destructure role from user object
      
      // Store token and role in sessionStorage (consistent with ProtectedRoute)
      sessionStorage.setItem('token', token);
      sessionStorage.setItem('isLoggedIn', 'true');
      sessionStorage.setItem('role', userRole); // Store role for easier access

      console.log('Login successful:', { role: userRole });

      // Navigate based on role
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
        {/* Mobile Number Field */}
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

        {/* Password Field */}
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

        {/* Role selection is no longer needed as the API determines the role */}

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
          backgroundColor: `${themeColors.error}15`,
          borderRadius: '6px',
          border: `1px solid ${themeColors.error}30`
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* Information Box */}
      <div style={{ 
        marginTop: '1.5rem', 
        padding: '1rem',
        backgroundColor: `${themeColors.secondary}10`,
        borderRadius: '6px',
        fontSize: '0.85rem',
        border: `1px solid ${themeColors.secondary}30`
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
        backgroundColor: `${themeColors.light}80`,
        padding: '0.5rem',
        borderRadius: '4px'
      }}>
        🗄️ Login credentials are validated against the database
      </div>
    </div>
  );
}

export default LoginPage;