import axios from 'axios';

// Create a central Axios instance
const api = axios.create({
  // This tells Axios to use your live Render URL in production.
  // In local development, it will default to '/' and use the "proxy" you set up.
  baseURL: process.env.REACT_APP_API_URL || '/'
});

export default api;
