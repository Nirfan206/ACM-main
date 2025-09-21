import React, { useEffect } from 'react';
import { Link, Routes, Route, useLocation } from 'react-router-dom';
import CareRequests from './customercare/CareRequests';
import CareMessaging from './customercare/CareMessaging';
import CareCustomers from './customercare/CareCustomers';
import CustomerCareProfile from './customercare/CustomerCareProfile';
import CareEmployeeAvailability from './customercare/CareEmployeeAvailability';
import CareBookService from './customercare/CareBookService'; // NEW: Import CareBookService

function CustomerCareDashboard() {
  const location = useLocation();

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <h2 className="sidebar-title">Customer Care</h2>
        <nav className="sidebar-nav">
          <ul>
            <li>
              <Link
                to="profile"
                className={location.pathname.includes('profile') ? 'active' : ''}
              >
                My Profile
              </Link>
            </li>
            <li>
              <Link
                to="requests"
                className={location.pathname.includes('requests') ? 'active' : ''}
              >
                Booking & Callback Requests
              </Link>
            </li>
            <li>
              <Link
                to="customers"
                className={location.pathname.includes('customers') ? 'active' : ''}
              >
                Manage Customers
              </Link>
            </li>
            <li>
              <Link
                to="book-service" // NEW: Link for booking a service
                className={location.pathname.includes('book-service') ? 'active' : ''}
              >
                Book a Service
              </Link>
            </li>
            <li>
              <Link
                to="messaging"
                className={location.pathname.includes('messaging') ? 'active' : ''}
              >
                Messaging
              </Link>
            </li>
            <li>
              <Link
                to="employee-availability"
                className={location.pathname.includes('employee-availability') ? 'active' : ''}
              >
                Employee Availability
              </Link>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <div className="card">
          <Routes>
            <Route path="profile" element={<CustomerCareProfile />} />
            <Route path="requests" element={<CareRequests />} />
            <Route path="customers" element={<CareCustomers />} />
            <Route path="book-service" element={<CareBookService />} /> {/* NEW: Route for booking a service */}
            <Route path="messaging" element={<CareMessaging />} />
            <Route path="employee-availability" element={<CareEmployeeAvailability />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default CustomerCareDashboard;