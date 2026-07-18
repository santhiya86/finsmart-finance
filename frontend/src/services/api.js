import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || '/api';
const API = axios.create({ baseURL });

API.interceptors.request.use((config) => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (user?.token) config.headers.Authorization = `Bearer ${user.token}`;
  } catch { localStorage.removeItem('user'); }
  return config;
});

API.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('user');
      if (!window.location.pathname.includes('/login') &&
          !window.location.pathname.includes('/register'))
        window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser = (data) => API.post('/auth/login', data);
export const getProfile = () => API.get('/auth/profile');

export const getTransactions = (params) => API.get('/transactions', { params });
export const addTransaction = (data) => API.post('/transactions', data);
export const updateTransaction = (id, data) => API.put(`/transactions/${id}`, data);
export const deleteTransaction = (id) => API.delete(`/transactions/${id}`);
export const getSummary = () => API.get('/transactions/summary');

export const getBudgets = (month) => API.get('/budgets', { params: { month } });
export const setBudget = (data) => API.post('/budgets', data);
export const deleteBudget = (id) => API.delete(`/budgets/${id}`);

export const getRecurring = () => API.get('/recurring');
export const addRecurring = (data) => API.post('/recurring', data);
export const toggleRecurring = (id) => API.put(`/recurring/${id}`);
export const deleteRecurring = (id) => API.delete(`/recurring/${id}`);
export const processRecurring = () => API.post('/recurring/process');

export const getGoals = () => API.get('/goals');
export const createGoal = (data) => API.post('/goals', data);
export const addSavings = (id, amount) => API.put(`/goals/${id}/save`, { amount });
export const deleteGoal = (id) => API.delete(`/goals/${id}`);

// Only monthly summary remains — budget alert is now fully automatic
export const sendMonthlySummary = (data) => API.post('/email/monthly-summary', data);

export default API;
