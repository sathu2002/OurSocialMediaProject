import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '../api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Load user from storage on app start
  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      console.log('Loading user from AsyncStorage...');
      const storedUser = await AsyncStorage.getItem('user');
      const storedToken = await AsyncStorage.getItem('token');
      
      console.log('Stored user:', storedUser);
      console.log('Stored token:', storedToken ? 'exists' : 'none');
      
      if (storedUser && storedToken) {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setIsAuthenticated(true);
        console.log('User authenticated successfully:', userData.role);
      } else {
        console.log('No stored credentials found');
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.log('Error loading user:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      console.log('Setting loading to false');
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      // Input validation
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Please enter a valid email address');
      }

      // Password validation
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      console.log('Attempting login for:', email);
      const response = await authApi.login({ email, password });
      const { _id, name, email: userEmail, role, token } = response;
      
      const userData = { _id, name, email: userEmail, role };
      
      // Store in AsyncStorage
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      
      setUser(userData);
      setIsAuthenticated(true);
      
      console.log('Login successful:', userData.role);
      return { success: true, user: userData };
    } catch (error) {
      console.log('Login error:', error.message);
      const message = error.message || 'Login failed. Please try again.';
      return { success: false, error: message };
    }
  };

  const register = async (name, email, password, role = 'Client') => {
    try {
      // Input validation
      if (!name || !email || !password) {
        throw new Error('Name, email, and password are required');
      }

      // Name validation
      if (name.trim().length < 2) {
        throw new Error('Name must be at least 2 characters long');
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Please enter a valid email address');
      }

      // Password validation
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      // Role validation
      const validRoles = ['Admin', 'Manager', 'Staff', 'Client'];
      if (!validRoles.includes(role)) {
        throw new Error(`Invalid role. Must be one of: ${validRoles.join(', ')}`);
      }

      console.log('Attempting registration for:', email, 'as', role);
      const response = await authApi.register({ name, email, password, role });
      const { _id, name: userName, email: userEmail, role: userRole, token } = response;
      
      const userData = { _id, name: userName, email: userEmail, role: userRole };
      
      // Store in AsyncStorage
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      
      setUser(userData);
      setIsAuthenticated(true);
      
      console.log('Registration successful:', userData.role);
      return { success: true, user: userData };
    } catch (error) {
      console.log('Registration error:', error.message);
      const message = error.message || 'Registration failed. Please try again.';
      return { success: false, error: message };
    }
  };

  const logout = async () => {
    try {
      console.log('Logging out user...');
      
      // Clear AsyncStorage
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      
      // Reset state
      setUser(null);
      setIsAuthenticated(false);
      
      console.log('Logout successful');
      return { success: true };
    } catch (error) {
      console.log('Error during logout:', error);
      // Still reset state even if storage cleanup fails
      setUser(null);
      setIsAuthenticated(false);
      return { success: false, error: 'Logout completed with errors' };
    }
  };

  const updateUser = async (updatedUserData) => {
    try {
      if (!user) {
        throw new Error('No user logged in');
      }

      const updatedUser = { ...user, ...updatedUserData };
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      console.log('User updated successfully');
      return { success: true, user: updatedUser };
    } catch (error) {
      console.log('Error updating user:', error);
      return { success: false, error: error.message };
    }
  };

  const hasRole = (allowedRoles) => {
    if (!user || !user.role) return false;
    return allowedRoles.includes(user.role);
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    updateUser,
    hasRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
