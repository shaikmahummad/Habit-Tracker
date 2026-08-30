import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({ baseURL: BASE_URL, timeout: 10000 });

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message = err?.response?.data?.message || err?.message || 'Network error';
    return Promise.reject(new Error(message));
  }
);

export const authApi = {
  register: (data) => api.post('/auth/register', data).then((r) => r.data),
  login: (data) => api.post('/auth/login', data).then((r) => r.data),
  updateProfile: (data) => api.put('/auth/profile', data).then((r) => r.data),
};

export const habitsApi = {
  list: () => api.get('/habits').then((r) => r.data),
  create: (data) => api.post('/habits', data).then((r) => r.data),
  update: (id, data) => api.put(`/habits/${id}`, data).then((r) => r.data),
  remove: (id) => api.delete(`/habits/${id}`).then((r) => r.data),
  toggle: (id) => api.post(`/habits/${id}/toggle`).then((r) => r.data),
  streak: (id) => api.get(`/habits/${id}/streak`).then((r) => r.data),
  weeklyStats: () => api.get('/habits/weekly-stats').then((r) => r.data),
  heatmap: (days = 84) => api.get(`/habits/heatmap?days=${days}`).then((r) => r.data),
  history: (month) => api.get(`/habits/history${month ? `?month=${month}` : ''}`).then((r) => r.data),
  habitStats: (id) => api.get(`/habits/${id}/stats`).then((r) => r.data),
  archive: (id) => api.patch(`/habits/${id}/archive`).then((r) => r.data),
  getArchived: () => api.get('/habits/archived').then((r) => r.data),
};

export const socialApi = {
  getLeaderboard: () => api.get('/social/leaderboard').then((r) => r.data),
  getFriends: () => api.get('/social/friends').then((r) => r.data),
  addFriend: (email) => api.post('/social/friends', { email }).then((r) => r.data),
  removeFriend: (userId) => api.delete(`/social/friends/${userId}`).then((r) => r.data),
};

export default api;
