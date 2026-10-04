import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config/constants';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const unwrap = (p) => p.then((r) => r.data?.data ?? r.data);

export const authAPI = {
  sendOtp: (phone, purpose = 'login') => unwrap(api.post('/auth/send-otp', { phone, purpose })),
  verifyOtp: (phone, otp) => unwrap(api.post('/auth/verify-otp', { phone, otp })),
  signup: (body) => unwrap(api.post('/auth/signup', body)),
  login: (identifier, password) => unwrap(api.post('/auth/login', { identifier, password })),
  me: () => unwrap(api.get('/auth/me')),
};

export const planAPI = {
  list: () => unwrap(api.get('/plans')),
  get: (id) => unwrap(api.get(`/plans/${id}`)),
};

export const subscriptionAPI = {
  create: (body) => unwrap(api.post('/subscriptions/create', body)),
  active: () => unwrap(api.get('/subscriptions/my-subscription')),
  mine: (page = 1) => unwrap(api.get(`/subscriptions/my?page=${page}`)),
  get: (id) => unwrap(api.get(`/subscriptions/${id}`)),
  update: (id, body) => unwrap(api.put(`/subscriptions/${id}`, body)),
  pause: (id, reason) => unwrap(api.post(`/subscriptions/${id}/pause`, { reason })),
  resume: (id) => unwrap(api.post(`/subscriptions/${id}/resume`)),
  cancel: (id) => unwrap(api.post(`/subscriptions/${id}/cancel`)),
};

export const deliveryAPI = {
  today: () => unwrap(api.get('/deliveries/today')),
  history: (page = 1) => unwrap(api.get(`/deliveries/history?page=${page}`)),
  get: (id) => unwrap(api.get(`/deliveries/${id}`)),
  qr: (id) => unwrap(api.get(`/deliveries/${id}/qr-code`)),
  rate: (id, score, comment) => unwrap(api.post(`/deliveries/${id}/rate`, { score, comment })),
  verifyQr: (id, token) => unwrap(api.post(`/deliveries/${id}/verify-qr`, { token })),
  setStatus: (id, body) => unwrap(api.patch(`/deliveries/${id}/status`, body)),
  assign: (id, deliveryBoyId) => unwrap(api.post(`/deliveries/${id}/assign`, { deliveryBoyId })),
  myRatings: () => unwrap(api.get('/deliveries/my-ratings')),
};

export const adminAPI = {
  dashboard: () => unwrap(api.get('/admin/dashboard')),
  users: (params = '') => unwrap(api.get(`/admin/users${params}`)),
  deliveryBoys: () => unwrap(api.get('/admin/users?role=deliveryBoy&limit=50')),
  setRole: (id, role) => unwrap(api.patch(`/admin/users/${id}/role`, { role })),
};

export const paymentAPI = {
  intent: (body) => unwrap(api.post('/payments/intent', body)),
  confirm: (id, success = true) => unwrap(api.post(`/payments/${id}/confirm`, { success })),
  mine: (page = 1) => unwrap(api.get(`/payments/my?page=${page}`)),
};

export const userAPI = {
  profile: () => unwrap(api.get('/users/profile')),
  updateProfile: (body) => unwrap(api.put('/users/profile', body)),
  addAddress: (body) => unwrap(api.post('/users/address', body)),
};
