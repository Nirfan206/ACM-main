import React, { useEffect } from 'react';
import { Link, Routes, Route, useLocation } from 'react-router-dom';
import EmployeeJobs from './employee/EmployeeJobs';
import EmployeeEarnings from './employee/EmployeeEarnings';
import EmployeeProfile from './employee/EmployeeProfile'; // NEW: Import EmployeeProfile
import EmployeeStatus from './employee/EmployeeStatus'; // NEW: Import EmployeeStatus
// Removed: import '../pages/dashboard.css'; // Ensure dashboard styles are loaded

function EmployeeDashboard() {
  const location = useLocation();

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <h2 className="sidebar-title">Employee Dashboard</h2>
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
                to="jobs"
                className={location.pathname.includes('jobs') ? 'active' : ''}
              >
                Jobs
              </Link>
            </li>
            <li>
              <Link
                to="earnings"
                className={location.pathname.includes('earnings') ? 'active' : ''}
              >
                Earnings
              </Link>
            </li>
            <li>
              <Link
                to="status"
                className={location.pathname.includes('status') ? 'active' : ''}
              >
                My Status
              </Link>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <div className="card">
          <Routes>
            <Route path="profile" element={<EmployeeProfile />} />
            <Route path="jobs" element={<EmployeeJobs />} />
            <Route path="earnings" element={<EmployeeEarnings />} />
            <Route path="status" element={<EmployeeStatus />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default EmployeeDashboard;