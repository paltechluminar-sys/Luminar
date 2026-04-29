import { useEffect, useState } from 'react';
import { supabase } from '../supabase';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Check current session on mount
        const sessionResult = await supabase.auth.getSession?.();
        const session = sessionResult?.data?.session;
        setUser(session?.user || null);
      } catch (err) {
        console.error('[useAuth] Error getting session:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes if available
    const authListener = supabase.auth.onAuthStateChange?.(
      (event, session) => {
        setUser(session?.user || null);
        setError(null);

        if (event === 'SIGNED_IN') {
          console.log('[useAuth] User signed in');
        } else if (event === 'SIGNED_OUT') {
          console.log('[useAuth] User signed out');
        }
      }
    );

    // Cleanup subscription
    return () => {
      authListener?.subscription?.unsubscribe?.();
    };
  }, []);

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      return true;
    } catch (err) {
      console.error('[useAuth] Sign out error:', err);
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('[useAuth] Google sign in error:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    signOut,
    signInWithGoogle,
  };
};
