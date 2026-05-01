import apiClient from './axiosConfig';

/**
 * Task Management API Service
 * Role-based access: Admin/Manager (all), Staff (own tasks only) with proper error handling
 */
export const taskApi = {
  /**
   * Get all tasks (Admin/Manager)
   * @returns {Promise} - Array of tasks
   */
  getTasks: async () => {
    try {
      const response = await apiClient.get('/tasks');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 
                    error.message || 
                    'Failed to fetch tasks';
      throw new Error(message);
    }
  },
  
  /**
   * Get my assigned tasks (Staff)
   * @returns {Promise} - Array of tasks assigned to current user
   */
  getMyTasks: async () => {
    try {
      const response = await apiClient.get('/tasks/my');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 
                    error.message || 
                    'Failed to fetch my tasks';
      throw new Error(message);
    }
  },
  
  /**
   * Get tasks by month for calendar view
   * @param {string} month - Format: 'YYYY-MM'
   * @returns {Promise} - Array of tasks for that month
   */
  getTasksByMonth: async (month) => {
    try {
      if (!month) {
        throw new Error('Month is required (format: YYYY-MM)');
      }
      
      // Basic month format validation
      if (!/^[0-9]{4}-(0[1-9]|1[0-2])$/.test(month)) {
        throw new Error('Invalid month format. Use YYYY-MM');
      }
      
      const response = await apiClient.get(`/tasks/calendar/${month}`);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 
                    error.message || 
                    'Failed to fetch tasks by month';
      throw new Error(message);
    }
  },
  
  /**
   * Create new task (Admin/Manager)
   * @param {Object} taskData - { title, description, assignedTo, clientId, status, priority, dueDate }
   * @returns {Promise} - Created task
   */
  createTask: async (taskData) => {
    try {
      // Validate input
      const requiredFields = ['title', 'assignedTo', 'clientId'];
      const missingFields = requiredFields.filter(field => !taskData[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      const validStatuses = ['Pending', 'In Progress', 'Completed', 'Cancelled'];
      if (taskData.status && !validStatuses.includes(taskData.status)) {
        throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
      }

      const validPriorities = ['Low', 'Medium', 'High', 'Urgent'];
      if (taskData.priority && !validPriorities.includes(taskData.priority)) {
        throw new Error(`Invalid priority. Must be one of: ${validPriorities.join(', ')}`);
      }

      const response = await apiClient.post('/tasks', taskData);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 
                    error.message || 
                    'Failed to create task';
      throw new Error(message);
    }
  },
  
  /**
   * Update task
   * @param {string} id - Task ID
   * @param {Object} taskData - Updated fields
   * @returns {Promise} - Updated task
   */
  updateTask: async (id, taskData) => {
    try {
      if (!id) {
        throw new Error('Task ID is required');
      }
      
      if (!taskData || Object.keys(taskData).length === 0) {
        throw new Error('Update data is required');
      }

      // Validate status if provided
      if (taskData.status) {
        const validStatuses = ['Pending', 'In Progress', 'Completed', 'Cancelled'];
        if (!validStatuses.includes(taskData.status)) {
          throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
        }
      }

      // Validate priority if provided
      if (taskData.priority) {
        const validPriorities = ['Low', 'Medium', 'High', 'Urgent'];
        if (!validPriorities.includes(taskData.priority)) {
          throw new Error(`Invalid priority. Must be one of: ${validPriorities.join(', ')}`);
        }
      }

      const response = await apiClient.put(`/tasks/${id}`, taskData);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 
                    error.message || 
                    'Failed to update task';
      throw new Error(message);
    }
  },
  
  /**
   * Delete task (Admin/Manager)
   * @param {string} id - Task ID
   * @returns {Promise} - Success message
   */
  deleteTask: async (id) => {
    try {
      if (!id) {
        throw new Error('Task ID is required');
      }
      
      const response = await apiClient.delete(`/tasks/${id}`);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 
                    error.message || 
                    'Failed to delete task';
      throw new Error(message);
    }
  },
};

export default taskApi;
