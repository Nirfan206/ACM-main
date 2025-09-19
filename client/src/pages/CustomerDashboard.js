import React, { useEffect } from 'react';
import { Link, Routes, Route, useLocation } from 'react-router-dom';
import CustomerBookings from './customer/CustomerBookings';
import CustomerProfile from './customer/CustomerProfile';
import CustomerReviews from './customer/CustomerReviews';
import CustomerNotifications from './customer/CustomerNotifications'; // NEW: Import CustomerNotifications

function CustomerDashboard() {
  const location = useLocation();

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <h2 className="sidebar-title">Customer Dashboard</h2>
        <nav className="sidebar-nav">
          <ul>
            <li>
              <Link
                to="bookings"
                className={location.pathname.includes('bookings') ? 'active' : ''}
              >
                Bookings
              </Link>
            </li>
            <li>
              <Link
                to="profile"
                className={location.pathname.includes('profile') ? 'active' : ''}
              >
                Profile
              </Link>
            </li>
            <li>
              <Link
                to="reviews"
                className={location.pathname.includes('reviews') ? 'active' : ''}
              >
                Reviews
              </Link>
            </li>
            <li>
              <Link
                to="notifications"
                className={location.pathname.includes('notifications') ? 'active' : ''}
              >
                Notifications
              </Link>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <div className="card">
          <Routes>
            <Route path="bookings" element={<CustomerBookings />} />
            <Route path="profile" element={<CustomerProfile />} />
            <Route path="reviews" element={<CustomerReviews />} />
            <Route path="notifications" element={<CustomerNotifications />} /> {/* NEW: Add notifications route */}
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default CustomerDashboard;