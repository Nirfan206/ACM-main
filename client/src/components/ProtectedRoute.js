import React from 'react';
import { Navigate } from 'react-router-dom';
import jwtDecode from 'jwt-decode';

function ProtectedRoute({ children, role }) {
  const token = sessionStorage.getItem('token'); // Changed from localStorage
  if (!token) return <Navigate to="/login" />;
  try {
    const decoded = jwtDecode(token);
    if (role && decoded.role !== role) return <Navigate to="/login" />;
    return children;
  } catch {
    return <Navigate to="/login" />;
  }
}

export default ProtectedRoute;