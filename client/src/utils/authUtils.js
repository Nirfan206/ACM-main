import jwtDecode from 'jwt-decode';

export const getUserRole = () => {
  const token = sessionStorage.getItem('token');
  if (token) {
    try {
      const decoded = jwtDecode(token);
      return decoded.role;
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  }
  return null;
};

export const getUserId = () => {
  const token = sessionStorage.getItem('token');
  if (token) {
    try {
      const decoded = jwtDecode(token);
      return decoded.id || decoded._id;
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  }
  return null;
};

export const isLoggedIn = () => {
  return !!sessionStorage.getItem('token');
};

export const logout = () => {
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('isLoggedIn');
  sessionStorage.removeItem('role');
};