/**
 * API Services Index
 * Centralized exports for all API services
 */

// Main API client
export { default as apiClient } from './axiosConfig';

// API Services
export { default as authApi } from './authApi';
export { default as userApi } from './userApi';
export { default as clientApi } from './clientApi';
export { default as taskApi } from './taskApi';
export { default as paymentApi } from './paymentApi';
export { default as feedbackApi } from './feedbackApi';
export { default as analyticsApi } from './analyticsApi';
export { default as aiApi } from './aiApi';
export { default as packageApi } from './packageApi';

// Legacy exports for backward compatibility (deprecated, use camelCase versions)
export { default as api } from './axiosConfig';
export { authApi as authAPI } from './authApi';
export { userApi as userAPI } from './userApi';
export { clientApi as clientAPI } from './clientApi';
export { taskApi as taskAPI } from './taskApi';
export { paymentApi as paymentAPI } from './paymentApi';
export { feedbackApi as feedbackAPI } from './feedbackApi';
export { analyticsApi as analyticsAPI } from './analyticsApi';
export { aiApi as aiAPI } from './aiApi';
