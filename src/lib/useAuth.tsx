import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from './supabase';

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  subscription_plan: 'free' | 'plus' | 'pro';
  subscription_status: 'active' | 'cancelled' | 'past_due' | 'trialing';
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  subscription_end_date: string | null;
  created_at: string;
  updated_at: string;
}

interface SubscriptionLimits {
  max_tools: number | null;
  max_favorites: number;
  max_news: number | null;
  can_write_reviews: boolean;
  can_compare: boolean;
  can_submit: boolean;
  has_analytics?: boolean;
  has_recommendations?: boolean;
  priority_support?: boolean;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  limits: SubscriptionLimits | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEFAULT_LIMITS: Record<string, SubscriptionLimits> = {
  free: {
    max_tools: 100,
    max_favorites: 3,
    max_news: 5,
    can_write_reviews: false,
    can_compare: false,
    can_submit: false,
  },
  plus: {
    max_tools: null,
    max_favorites: 999999,
    max_news: null,
    can_write_reviews: true,
    can_compare: true,
    can_submit: true,
  },
  pro: {
    max_tools: null,
    max_favorites: 999999,
    max_news: null,
    can_write_reviews: true,
    can_compare: true,
    can_submit: true,
    has_analytics: true,
    has_recommendations: true,
    priority_support: true,
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [limits, setLimits] = useState<SubscriptionLimits | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setProfile(data as UserProfile);
        setLimits(DEFAULT_LIMITS[data.subscription_plan] || DEFAULT_LIMITS.free);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await loadProfile(user.id);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        setUser(session?.user ?? null);
        if (session?.user) {
          await loadProfile(session.user.id);
        } else {
          setProfile(null);
          setLimits(null);
        }
        setLoading(false);
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setLimits(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, limits, loading, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
