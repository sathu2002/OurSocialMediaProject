import axios from 'axios';

// 💡 Beginner Note: This instance connects to our backend automatically.
// It uses an intercepter to attach the JWT token to every request we send 
// so the backend knows we are logged in!

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
});

// Request Interceptor: Attach Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    // If token exists, add it to the Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle 401 Unauthorized globally
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // If the server says our token is invalid/expired
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      // Redirect to login page if unauthorized (and not already on login)
      if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
