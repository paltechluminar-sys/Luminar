/**
 * Supabase Client Configuration
 * Initialize Supabase client for authentication and database operations
 * Falls back to a mock client if credentials are not configured
 */

import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config';

/**
 * Mock Supabase client for offline/demo mode (complete mock that prevents errors)
 */
const mockSupabase = {
  auth: {
    getUser: async () => ({ data: { user: null } }),
    getSession: async () => ({ data: { session: null }, error: null }),
    signOut: async () => ({ error: null }),
    signInWithOAuth: async () => ({ data: null, error: null }),
    onAuthStateChange: (callback) => {
      // Return a proper listener object with unsubscribe
      return {
        subscription: {
          unsubscribe: () => {}
        }
      };
    },
    session: null,
  },
  from: (table) => ({
    select: () => ({
      eq: () => ({ data: [], error: null }),
      order: () => ({ data: [], error: null }),
      gte: () => ({ data: [], error: null }),
      head: () => ({ data: [], error: null, count: 0 }),
      limit: () => ({ data: [], error: null }),
    }),
    update: () => ({
      eq: () => ({ data: null, error: null }),
    }),
    insert: () => ({
      data: null,
      error: null,
    }),
    delete: () => ({
      eq: () => ({ data: null, error: null }),
    }),
  }),
  storage: {
    from: () => ({
      upload: () => ({ data: null, error: { message: 'Storage not configured' } }),
      download: () => ({ data: null, error: { message: 'Storage not configured' } }),
      remove: () => ({ data: null, error: null }),
    }),
  },
};

let supabase = null;
let isConfigured = false;

// Try to initialize Supabase if credentials are provided
if (SUPABASE_URL && SUPABASE_ANON_KEY) {
  try {
    // This will work because @supabase/supabase-js is already installed
    // We just need to import it safely
    const supabaseModule = require('@supabase/supabase-js');
    supabase = supabaseModule.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    isConfigured = true;
    console.info('✅ Supabase client initialized successfully');
  } catch (error) {
    console.warn('⚠️  Failed to initialize Supabase:', error?.message ||error);
    supabase = mockSupabase;
  }
} else {
  console.info('ℹ️  Supabase credentials not configured. Using mock client for demo mode.');
  supabase = mockSupabase;
}

/**
 * Helper function to check if Supabase is properly configured
 */
export const isSupabaseConfigured = () => isConfigured;

/**
 * Helper function to get current authenticated user
 */
export const getCurrentUser = async () => {
  try {
    if (supabase?.auth?.getUser) {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    }
    return null;
  } catch (error) {
    console.error('Error fetching current user:', error);
    return null;
  }
};

/**
 * Helper function to sign out user
 */
export const signOutUser = async () => {
  try {
    if (supabase?.auth?.signOut) {
      await supabase.auth.signOut();
    }
  } catch (error) {
    console.error('Error signing out:', error);
  }
};

// Export the Supabase client
export { supabase };

export default supabase;
