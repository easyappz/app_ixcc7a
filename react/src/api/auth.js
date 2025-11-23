import instance from './axios';

/**
 * Register a new user
 * @param {string} username - Username for registration
 * @param {string} password - Password for registration
 * @returns {Promise} Response data
 */
export const registerUser = async (username, password) => {
  try {
    const response = await instance.post('/api/register/', {
      username,
      password
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Login user
 * @param {string} username - Username for login
 * @param {string} password - Password for login
 * @returns {Promise} Response data with token
 */
export const loginUser = async (username, password) => {
  try {
    const response = await instance.post('/api/login/', {
      username,
      password
    });
    
    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token);
    }
    
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Logout user
 * @returns {Promise} Response data
 */
export const logoutUser = async () => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await instance.post('/api/logout/', {}, {
      headers: {
        'Authorization': `Token ${token}`
      }
    });
    
    localStorage.removeItem('authToken');
    
    return response.data;
  } catch (error) {
    localStorage.removeItem('authToken');
    throw error;
  }
};

/**
 * Get current member data
 * @returns {Promise} Response data with current member info
 */
export const getCurrentMember = async () => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await instance.get('/api/members/me/', {
      headers: {
        'Authorization': `Token ${token}`
      }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
