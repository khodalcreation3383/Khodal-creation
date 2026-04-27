/**
 * API Configuration
 * Update BACKEND_URL when deploying to different environments
 */

// Production backend URL
export const BACKEND_URL = 'https://khodalcreation-backend.vercel.app';

// API endpoints
export const API_ENDPOINTS = {
  AUTH: '/api/auth',
  DESIGNS: '/api/designs',
  PARTIES: '/api/parties',
  STOCK: '/api/stock',
  BILLS: '/api/bills',
  PAYMENTS: '/api/payments',
  SETTINGS: '/api/settings',
  DASHBOARD: '/api/dashboard',
  REPORTS: '/api/reports'
};

// Get base URL based on environment
export const getBaseURL = () => {
  if (process.env.NODE_ENV === 'production') {
    return `${BACKEND_URL}/api`;
  }
  // Development uses Vite proxy
  return '/api';
};

export default {
  BACKEND_URL,
  API_ENDPOINTS,
  getBaseURL
};
