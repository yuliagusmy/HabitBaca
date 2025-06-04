import { Session, User } from '@supabase/supabase-js';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { UserProfile } from '../types/supabase';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setProfile(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;

      if (data) {
        setProfile(data);
      } else {
        // Create profile if it doesn't exist
        await createUserProfile(userId);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createUserProfile = async (userId: string) => {
    try {
      // Get user email from auth
      const { data: userData } = await supabase.auth.getUser();
      const email = userData?.user?.email || '';
      const username = email.split('@')[0];

      const { data, error } = await supabase
        .from('user_profiles')
        .insert({
          user_id: userId,
          username,
          level: 1,
          xp: 0,
          streak: 0
        })
        .select()
        .single();

      if (error) throw error;

      setProfile(data);
    } catch (error) {
      console.error('Error creating user profile:', error);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setIsLoading(true);
      // Gunakan URL yang berbeda untuk development dan production
      const redirectTo = process.env.NODE_ENV === 'development'
        ? 'http://localhost:5173'
        : window.location.origin;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo
        }
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error signing in with Google:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      // Jika session tidak ada, clear localStorage/cookies dan reload
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // Clear localStorage/cookies Supabase
        localStorage.clear();
        document.cookie = '';
        window.location.href = '/login';
        return;
      }
      // Jika session ada, logout seperti biasa
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Error signing out:', error);
      // Fallback: force clear and redirect
      localStorage.clear();
      document.cookie = '';
      window.location.href = '/login';
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ session, user, profile, isLoading, signInWithGoogle, signOut, refreshProfile: () => user ? fetchUserProfile(user.id) : Promise.resolve() }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};