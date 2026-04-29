import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabase';

const SubscriptionContext = createContext(null);

export const SubscriptionProvider = ({ children }) => {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Get initial session
        const sessionResult = await supabase.auth.getSession?.();
        const session = sessionResult?.data?.session;

        if (session?.user) {
          setUser(session.user);
          await loadSubscription(session.user.id);
        } else {
          setSubscription({ tier: 'basic', expiresAt: null });
          setLoading(false);
        }
      } catch (err) {
        console.error('[SubscriptionContext] Init error:', err);
        setSubscription({ tier: 'basic', expiresAt: null });
        setLoading(false);
      }
    };

    initAuth();

    // Track auth state changes if available
    const authListener = supabase.auth.onAuthStateChange?.(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          await loadSubscription(session.user.id);
        } else {
          setUser(null);
          setSubscription({ tier: 'basic', expiresAt: null });
          setLoading(false);
        }
      }
    );

    return () => {
      authListener?.subscription?.unsubscribe?.();
    };
  }, []);

  const loadSubscription = async (userId) => {
    try {
      setLoading(true);
      setError(null);

      // Query user profile from Supabase
      const { data, error: queryError } = await supabase
        .from('profiles')
        .select('subscription_tier, subscription_expires_at')
        .eq('id', userId)
        .single();

      if (queryError && queryError.code !== 'PGRST116') {
        // PGRST116 is "not found" - that's ok for new users
        throw queryError;
      }

      const tier = data?.subscription_tier || 'basic';
      const expiresAt = data?.subscription_expires_at;

      // Check if subscription expired
      if (expiresAt) {
        const now = new Date();
        const expireDate = new Date(expiresAt);
        if (now > expireDate) {
          // Subscription expired, revert to basic
          await updateSubscriptionTier(userId, 'basic');
          setSubscription({ tier: 'basic', expiresAt: null });
          return;
        }
      }

      setSubscription({ tier, expiresAt });
    } catch (err) {
      console.error('[SubscriptionContext] Failed to load subscription:', err);
      setError(err.message);
      // Default to basic on error
      setSubscription({ tier: 'basic', expiresAt: null });
    } finally {
      setLoading(false);
    }
  };

  const updateSubscriptionTier = async (userId, tier, expiresAt = null) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('profiles')
        .update({
          subscription_tier: tier,
          subscription_expires_at: expiresAt,
        })
        .eq('id', userId);

      if (error) throw error;

      setSubscription({ tier, expiresAt });
      return true;
    } catch (err) {
      console.error('[SubscriptionContext] Failed to update tier:', err);
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const refreshSubscription = async () => {
    if (user) {
      await loadSubscription(user.id);
    }
  };

  const value = {
    user,
    subscription,
    loading,
    error,
    refreshSubscription,
    updateSubscriptionTier: (tier, expiresAt) =>
      user ? updateSubscriptionTier(user.id, tier, expiresAt) : Promise.reject('No user'),
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};
