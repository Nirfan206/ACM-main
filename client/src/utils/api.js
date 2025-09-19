import axios from 'axios';
import { logout } from './authUtils'; // Import logout utility

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Your backend API base URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// Optional: Add an interceptor to include the JWT token in every request
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token'); // Changed from localStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add an interceptor for responses to handle 401/403 errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      console.warn('Authentication error (401/403) detected. Logging out...');
      logout(); // Use the centralized logout function
      // Optionally redirect to login page, but ProtectedRoute should handle this
      // window.location.href = '/login'; 
    }
    return Promise.reject(error);
  }
);

export default api;