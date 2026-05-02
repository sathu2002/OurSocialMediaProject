import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const getDefaultApiUrl = () => {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5000/api';
  }

  return 'http://localhost:5000/api';
};

// Expo only exposes EXPO_PUBLIC_* env vars to the client bundle.
const API_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  process.env.API_URL ||
  getDefaultApiUrl();

// Create axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.log('Error getting token from AsyncStorage:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Clear token on auth error
      try {
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');
      } catch (e) {
        console.log('Error clearing AsyncStorage:', e);
      }
    }

    // Global error handling
    if (error.response) {
      // Server responded with error
      console.log('API Error:', error.response.data?.message || error.response.data);
    } else if (error.request) {
      // No response received
      console.log(`Network Error - No response from server at ${API_URL}`);
    } else {
      // Request setup error
      console.log('Request Error:', error.message);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
