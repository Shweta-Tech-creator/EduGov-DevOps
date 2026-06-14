import axios from 'axios';

// Create Axios Instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8082/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: Attach JWT Token if exists in localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle general errors globally
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Check if error is unauthorized (token expired, invalid, etc.)
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Clear token and user storage, trigger redirection by reloading (or letting AuthContext handle it)
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

export default api;
