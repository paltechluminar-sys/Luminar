/**
 * Application Configuration
 */

// API Configuration
export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Supabase Configuration
export const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || '';
export const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

// Feature Flags
export const FEATURES = {
  ADMIN_PANEL: true,
  USER_ADS: true,
  EMAIL_NOTIFICATIONS: true,
  FINANCIAL_TRACKING: true,
};

// Admin Configuration
export const ADMIN_CONFIG = {
  PAGE_SIZE: 20,
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
};

export default {
  API_URL,
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  FEATURES,
  ADMIN_CONFIG,
};
