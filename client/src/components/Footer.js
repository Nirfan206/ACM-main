import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Footer.css';

const Footer = () => {
  return (
    <footer className="main-footer">
      <div className="footer-container">
        <div className="footer-section company-info">
          <h3 className="company-title">AL CHAAN MEERA</h3>
          <p className="company-subtitle">(Air Conditioning & Maintenance Company)</p>
          <p>Your trusted partner for all AC and electrical services.</p>
        </div>
        
        <div className="footer-section contact-info">
          <h3>Contact Us</h3>
          <p><strong>Hours:</strong> Open 24 hours</p>
          <p><strong>Phone:</strong> 9966972228</p>
          <p><strong>Address:</strong> అత్తర్ అల్లాహ్ బక్ష్ నగర్ (Attar Allah Baksh Nagar), 2వ లైను (2nd Line గవవర్నమెంట్ హాస్పిటల్ ప్రక్కన, Chirala Rd, beside Government Hospital, Chilakaluripet, Andhra Pradesh 522616</p>
        </div>
        
        <div className="footer-section quick-links">
          <h3>Quick Links</h3>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/services">Services</Link></li>
            <li><Link to="/reviews">Reviews</Link></li>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/register">Register</Link></li>
            <li><Link to="/privacy-policy">Privacy Policy</Link></li> {/* New Link */}
            <li><Link to="/terms-conditions">Terms & Conditions</Link></li> {/* New Link */}
          </ul>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} AL CHAAN MEERA. All Rights Reserved.</p>
        <p className="developer-credit">Developed by NANASANA IRFAN</p>
      </div>
    </footer>
  );
};

export default Footer;