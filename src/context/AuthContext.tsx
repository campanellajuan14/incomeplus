import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../integrations/supabase/client';
import { UserProfile } from '../types/dashboard';

// Helper function to clean up auth state
const cleanupAuthState = () => {
  // Remove standard auth tokens
  localStorage.removeItem('supabase.auth.token');
  // Remove all Supabase auth keys from localStorage
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      localStorage.removeItem(key);
    }
  });
  // Remove from sessionStorage if in use
  Object.keys(sessionStorage || {}).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      sessionStorage.removeItem(key);
    }
  });
};

type AuthContextType = {
  session: Session | null;
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signOut: () => Promise<void>;
  refetchProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  userProfile: null,
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  refetchProfile: async () => {},
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile from database with auto-creation
  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('Fetching profile for user:', userId);
      // Use the new secure function that auto-creates profiles
      const { data, error } = await supabase
        .rpc('get_or_create_user_profile', { target_user_id: userId });

      if (error) {
        console.error('Error fetching/creating user profile:', error);
        // Even if profile fetch fails, we should not block the user
        setUserProfile(null);
        return;
      }

      if (data && data.length > 0) {
        const profile = data[0];
        console.log('Profile fetched successfully:', profile);
        setUserProfile({
          user_id: profile.user_id || '',
          username: profile.username || '',
          phone: profile.phone || '',
          company: profile.company || '',
          bio: profile.bio || '',
          user_type: profile.user_type || 'investor',
          account_status: profile.account_status || 'active',
          email_notifications: profile.email_notifications ?? true,
          sms_notifications: profile.sms_notifications ?? false,
          created_at: profile.created_at || '',
          updated_at: profile.updated_at || ''
        });
      } else {
        console.log('No profile data returned, setting null');
        setUserProfile(null);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // Don't block user access even if profile fails
      setUserProfile(null);
    }
  };

  const refetchProfile = async () => {
    if (user?.id) {
      await fetchUserProfile(user.id);
    }
  };
  
  useEffect(() => {
    let mounted = true;

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('Auth state changed:', event, 'Session exists:', !!newSession);
        
        if (!mounted) return;
        
        // Update session and user state
        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        // Handle different auth events
        if (event === 'SIGNED_IN' && newSession?.user) {
          console.log('User signed in, fetching profile...');
          await fetchUserProfile(newSession.user.id);
          setLoading(false);
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out');
          setUserProfile(null);
          setLoading(false);
        } else if (event === 'TOKEN_REFRESHED' && newSession?.user) {
          console.log('Token refreshed');
          setLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session: currentSession } }) => {
      if (!mounted) return;
      
      console.log('Initial session check:', !!currentSession);
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      // Fetch profile if user is signed in
      if (currentSession?.user) {
        console.log('Found existing session, fetching profile...');
        await fetchUserProfile(currentSession.user.id);
      }
      
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      // Clean up existing auth state
      cleanupAuthState();
      
      // Attempt global sign out
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continue even if this fails
      }
      
      console.log('Attempting to sign in...');
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      
      console.log('Sign in successful, auth state change will handle redirect');
      // Don't force redirect here - let the auth state change handle it
    } catch (error: any) {
      setLoading(false);
      console.error('Error signing in:', error.message);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, username: string) => {
    try {
      // Clean up existing auth state
      cleanupAuthState();
      
      const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            username: username.trim()
          }
        }
      });
      if (error) throw error;
      // Don't navigate here as they need to confirm email first
    } catch (error: any) {
      console.error('Error signing up:', error.message);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      // Clean up auth state
      cleanupAuthState();
      
      // Attempt global sign out
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Ignore errors
      }
      
      // Force page reload for a clean state
      window.location.href = '/auth';
    } catch (error: any) {
      console.error('Error signing out:', error.message);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ session, user, userProfile, loading, signIn, signUp, signOut, refetchProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
