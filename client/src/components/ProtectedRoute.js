import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import jwtDecode from 'jwt-decode';

export default function ProtectedRoute({ role, children }) {
  const [ready, setReady] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);
  const [hasRole, setHasRole] = useState(true); // default allow if no role required

  useEffect(() => {
    // Bootstrap once: read and validate token synchronously
    const token = sessionStorage.getItem('token');
    if (!token) {
      setIsAuthed(false);
      setHasRole(false);
      setReady(true);
      return;
    }
    try {
      const decoded = jwtDecode(token);
      setIsAuthed(true);
      setHasRole(!role || decoded.role === role);
    } catch {
      setIsAuthed(false);
      setHasRole(false);
    } finally {
      setReady(true);
    }
  }, [role]);

  if (!ready) return null; // or a small loader

  if (!isAuthed || !hasRole) {
    return <Navigate to="/login" replace />;
  }

  // Works with both patterns:
  // 1) <ProtectedRoute><Dashboard/></ProtectedRoute>
  // 2) <Route element={<ProtectedRoute/>}><Route .../></Route>
  return children ? children : <Outlet />;
}
