import instance from './axios';

/**
 * Get current member profile
 * @returns {Promise} Response data with current member
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

/**
 * Get list of online members
 * @returns {Promise} Response data with online members
 */
export const getOnlineMembers = async () => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await instance.get('/api/members/online/', {
      headers: {
        'Authorization': `Token ${token}`
      }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
