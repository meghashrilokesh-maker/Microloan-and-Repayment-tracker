import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to all requests if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('trackshack_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Centralized error message extractor
export function getErrorMessage(error, defaultMsg = 'An error occurred') {
  if (error.response && error.response.data && error.response.data.error) {
    return error.response.data.error;
  }
  if (error.message) {
    return error.message;
  }
  return defaultMsg;
}

export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials).then((res) => res.data),
  register: (data) => api.post('/auth/register', data).then((res) => res.data),
  getMe: () => api.get('/auth/me').then((res) => res.data),
  updateProfile: (profileData) => api.put('/auth/profile', profileData).then((res) => res.data),
};

export const financialsApi = {
  getAll: () => api.get('/financials/all').then((res) => res.data),
  addSale: (saleData) => api.post('/sales', saleData).then((res) => res.data),
  deleteSale: (id) => api.delete(`/sales/${id}`).then((res) => res.data),
  addExpense: (expenseData) => api.post('/expenses', expenseData).then((res) => res.data),
  deleteExpense: (id) => api.delete(`/expenses/${id}`).then((res) => res.data),
  addLoan: (loanData) => api.post('/loans', loanData).then((res) => res.data),
  addRepayment: (repaymentData) => api.post('/repayments', repaymentData).then((res) => res.data),
  reset: () => api.post('/financials/reset').then((res) => res.data),
};

export function connectSSE(onEvent) {
  const token = localStorage.getItem('trackshack_token');
  if (!token) return null;

  try {
    const sse = new EventSource(`/api/events?token=${encodeURIComponent(token)}`);

    sse.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data && onEvent) {
          onEvent(data);
        }
      } catch (e) {
        console.error('Error parsing SSE data:', e);
      }
    };

    sse.onerror = (err) => {
      // Browsers automatically attempt reconnection on network drops
      console.warn('SSE connection warning or reconnecting...', err);
    };

    return sse;
  } catch (err) {
    console.error('Failed to initialize SSE:', err);
    return null;
  }
}

export default api;
