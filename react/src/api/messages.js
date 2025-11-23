import instance from './axios';

/**
 * Get all messages
 * @returns {Promise} Response data with messages
 */
export const getMessages = async () => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await instance.get('/api/messages/', {
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
 * Send a new message
 * @param {string} text - Message text
 * @returns {Promise} Response data with created message
 */
export const sendMessage = async (text) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await instance.post('/api/messages/', 
      { text },
      {
        headers: {
          'Authorization': `Token ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
