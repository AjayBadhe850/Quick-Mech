/**
 * Centralized API Client for QuickMech
 */
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const getAuthToken = () => {
  try {
    return localStorage.getItem('token') || null;
  } catch {
    return null;
  }
};

const request = async (endpoint, options = {}) => {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
  const token = getAuthToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...(options.headers || {})
  };

  const config = {
    ...options,
    headers
  };

  try {
    const response = await fetch(url, config);
    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');
    const data = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      const errorMessage = (typeof data === 'object' && (data.message || data.error?.message)) || `Request failed with status ${response.status}`;
      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    if (!err.status) {
      err.message = 'Unable to connect to QuickMech server. Please verify network connection or try again shortly.';
    }
    throw err;
  }
};

export const api = {
  get: (endpoint, options) => request(endpoint, { method: 'GET', ...options }),
  post: (endpoint, body, options) => request(endpoint, { method: 'POST', body: JSON.stringify(body), ...options }),
  put: (endpoint, body, options) => request(endpoint, { method: 'PUT', body: JSON.stringify(body), ...options }),
  patch: (endpoint, body, options) => request(endpoint, { method: 'PATCH', body: JSON.stringify(body), ...options }),
  delete: (endpoint, options) => request(endpoint, { method: 'DELETE', ...options })
};

export const authAPI = {
  sendOtp: (contactValue, username) => api.post('/api/auth/send-otp', { contactValue, username }),
  verifyOtp: (contactValue, otp) => api.post('/api/auth/verify-otp', { contactValue, otp }),
  resendOtp: (contactValue) => api.post('/api/auth/resend-otp', { contactValue }),
  getProfile: () => api.get('/api/auth/me'),
  recordSession: (data) => api.post('/api/auth/session', data).catch(() => {})
};

export const mechanicsAPI = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/api/mechanics${query ? `?${query}` : ''}`);
  },
  getNearby: (lat, lng, radius = 50, category) => {
    const query = new URLSearchParams({
      lat,
      lng,
      radius,
      ...(category && category !== 'All' && { category })
    }).toString();
    return api.get(`/api/mechanics/nearby?${query}`);
  },
  getById: (id) => api.get(`/api/mechanics/${id}`),
  getImages: (id) => api.get(`/api/mechanics/${id}/images`),
  uploadImages: (id, images) => api.post(`/api/mechanics/${id}/images`, { images }),
  create: (data) => api.post('/api/mechanics', data),
  update: (id, data) => api.put(`/api/mechanics/${id}`, data),
  delete: (id) => api.delete(`/api/mechanics/${id}`)
};

export const bookingsAPI = {
  create: (bookingData) => api.post('/api/bookings', bookingData),
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/api/bookings${query ? `?${query}` : ''}`);
  },
  updateStatus: (id, status) => api.patch(`/api/bookings/${id}/status`, { status })
};

export const paymentsAPI = {
  record: (paymentData) => api.post('/api/payments', paymentData),
  getForUser: (mobileNumber) => api.get(`/api/payments/${mobileNumber}`)
};

export const reviewsAPI = {
  getAll: (mechanicId) => api.get(`/api/reviews${mechanicId ? `?mechanicId=${mechanicId}` : ''}`),
  create: (reviewData) => api.post('/api/reviews', reviewData)
};

export const healthAPI = {
  check: () => api.get('/api/health')
};

export default api;
