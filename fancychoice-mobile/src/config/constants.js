import { Platform } from 'react-native';

export const API_URL = Platform.OS === 'android'
  ? 'http://10.0.2.2:5000/api'
  : 'http://localhost:5000/api';

// Zomato-style food-delivery theme: signature red on clean white/grey.
export const COLORS = {
  primary: '#E23744',
  primaryDark: '#CB202D',
  bg: '#F6F6F6',
  card: '#FFFFFF',
  text: '#1C1C1C',
  muted: '#696969',
  border: '#E8E8E8',
  accent: '#FCECEC',
  success: '#2E7D32',
  warning: '#F9A825',
  danger: '#B71C1C',
};

export const BILLING_CYCLES = [
  { key: 'monthly', label: 'Monthly' },
  { key: 'quarterly', label: 'Quarterly' },
  { key: 'yearly', label: 'Yearly' },
];
