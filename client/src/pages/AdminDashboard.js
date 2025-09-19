import React from 'react';
import { Link, Routes, Route, useLocation } from 'react-router-dom';
import AdminUsers from './admin/AdminUsers';
import AdminServices from './admin/AdminServices';
import AdminProfile from './admin/AdminProfile';
import AdminAnalytics from './admin/AdminAnalytics';
import AdminSettings from './admin/AdminSettings';
import AdminEmployeeStatus from './admin/AdminEmployeeStatus';
import AdminBookings from './admin/AdminBookings'; // NEW: Import AdminBookings

function AdminDashboard() {
  const location = useLocation();

  const navLinks = [
    { path: "profile", label: "My Profile" },
    { path: "users", label: "Users" },
    { path: "services", label: "Services" },
    { path: "bookings", label: "Bookings" }, // NEW: Add bookings link
    { path: "analytics", label: "Analytics" },
    { path: "settings", label: "Settings" },
    { path: "employee-status", label: "Employee Status" },
  ];

  // Function to determine the title based on the current path
  const getTitle = () => {
    if (location.pathname.includes('profile')) return 'My Profile';
    if (location.pathname.includes('users')) return 'Manage Users';
    if (location.pathname.includes('services')) return 'Manage Services';
    if (location.pathname.includes('bookings')) return 'Manage Bookings'; // NEW: Title for bookings
    if (location.pathname.includes('analytics')) return 'Site Analytics';
    if (location.pathname.includes('settings')) return 'Site Settings';
    if (location.pathname.includes('employee-status')) return 'Employee Status Monitor';
    return 'Admin Dashboard';
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <Link to="/admin" style={{ textDecoration: 'none' }}>
            <span style={{ color: 'var(--color-primary)' }}>AL CHAAN MEERA</span>
          </Link>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-textLight)', marginTop: '5px' }}>
            (Air Conditioning & Maintenance Company)
          </div>
        </div>
        <nav className="sidebar-nav">
          <ul>
            {navLinks.map((link) => (
              <li key={link.path}>
                <Link
                  to={link.path}
                  className={location.pathname.includes(link.path) ? 'active' : ''}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <div className="content-header">
          <h1 style={{ color: 'var(--color-primary)', fontSize: '1.8rem', fontWeight: 'bold' }}>
            {getTitle()}
          </h1>
        </div>
        <div className="card">
          <Routes>
            <Route path="profile" element={<AdminProfile />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="services" element={<AdminServices />} />
            <Route path="bookings" element={<AdminBookings />} /> {/* NEW: Add bookings route */}
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="employee-status" element={<AdminEmployeeStatus />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;