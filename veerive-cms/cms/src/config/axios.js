// import axios from 'axios'

// export default axios.create ({
//     baseURL: 'https://veeriveoct5.onrender.com'
// })

// // export default axios.create ({
// //     baseURL: 'https://veeriveoct5.onrender.com'
// // })

// import axios from 'axios';

// const baseURL =
//   process.env.NODE_ENV === 'development'
//     ? 'http://localhost:3050' // Backend running locally
//     : 'https://veeriveoct5.onrender.com'; // Deployed backend

// export default axios.create({
//   baseURL,
//   headers: {
//     'Content-Type': 'application/json',
//   },
//   withCredentials: true, // Ensure cookies and headers are sent
// });
import axios from 'axios';

// IMPORTANT: every call site already prefixes paths with '/api/...', so the
// baseURL must NOT include '/api' (otherwise requests become '/api/api/...').
// Default to the local backend for dev; override per-environment with
// REACT_APP_API_BASE_URL (e.g. '' for same-origin deploys, or the backend URL).
const baseURL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3050';

const axiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Ensure cookies and headers are sent
  timeout: 30000, // 30 second timeout
});

// ✅ Automatically add Authorization header to every request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Handle JWT token errors in responses
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token is invalid or expired
      sessionStorage.removeItem('token');
      
      // Redirect to login if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    // Handle JWT malformed errors specifically
    if (error.response?.data?.error?.includes('jwt malformed') || 
        error.response?.data?.error?.includes('Invalid token')) {
      sessionStorage.removeItem('token');
      
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;
