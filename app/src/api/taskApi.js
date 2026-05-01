import apiClient from './axiosConfig';

/**
 * Task Management API Service
 * Role-based access: Admin/Manager (all), Staff (own tasks only)
 */
export const taskApi = {
  /**
   * Get all tasks (Admin/Manager)
   * @returns {Promise} - Array of tasks
   */
  getTasks: () => apiClient.get('/tasks'),
  
  /**
   * Get my assigned tasks (Staff)
   * @returns {Promise} - Array of tasks assigned to current user
   */
  getMyTasks: () => apiClient.get('/tasks/my'),
  
  /**
   * Get tasks by month for calendar view
   * @param {string} month - Format: 'YYYY-MM'
   * @returns {Promise} - Array of tasks for that month
   */
  getTasksByMonth: (month) => apiClient.get(`/tasks/calendar/${month}`),
  
  /**
   * Create new task (Admin/Manager)
   * @param {Object} taskData - { title, description, assignedTo, clientId, status, priority, dueDate }
   * @returns {Promise} - Created task
   */
  createTask: (taskData) => apiClient.post('/tasks', taskData),
  
  /**
   * Update task
   * @param {string} id - Task ID
   * @param {Object} taskData - Updated fields
   * @returns {Promise} - Updated task
   */
  updateTask: (id, taskData) => apiClient.put(`/tasks/${id}`, taskData),
  
  /**
   * Delete task (Admin/Manager)
   * @param {string} id - Task ID
   * @returns {Promise} - Success message
   */
  deleteTask: (id) => apiClient.delete(`/tasks/${id}`),
};

export default taskApi;
