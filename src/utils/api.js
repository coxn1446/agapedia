// Utility functions for API calls

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const apiCall = async (endpoint, options = {}) => {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  const response = await fetch(url, {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    const errorObj = new Error(error.error || 'Request failed');
    errorObj.response = { data: error, status: response.status };
    throw errorObj;
  }

  return response.json();
};

// API client with convenience methods
const api = {
  get: (endpoint) => apiCall(endpoint, { method: 'GET' }),
  post: (endpoint, data) => apiCall(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  put: (endpoint, data) => apiCall(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (endpoint, options = {}) => apiCall(endpoint, {
    method: 'DELETE',
    ...options,
  }),
};

export default api;
export { apiCall };

