import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/Header.css';

const Header = () => {
  const location = useLocation();
  
  // Check if the current path is active
  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };
  
  return (
    <header className="main-header">
      <div className="header-container">
        <div className="logo-container">
          <Link to="/" className="logo-link">
            <img src="/logo.jpg" alt="AL CHAAN MEERA Logo" className="company-logo" />
            <div className="logo-text-container">
              <span className="company-name">AL CHAAN MEERA</span>
              <span className="company-tagline">(Air Conditioning & Maintenance Company)</span>
            </div>
          </Link>
        </div>
        
        <nav className="main-nav">
          <Link to="/" className={`nav-link ${isActive('/')}`}>Home</Link>
          <Link to="/services" className={`nav-link ${isActive('/services')}`}>Services</Link>
          <Link to="/reviews" className={`nav-link ${isActive('/reviews')}`}>Reviews</Link>
          <Link to="/login" className={`nav-link ${isActive('/login')}`}>Login</Link>
          <Link to="/register" className={`nav-link ${isActive('/register')}`}>Register</Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;