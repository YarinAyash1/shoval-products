'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    // Check for active session on component mount
    const checkSession = async () => {
      try {
        console.log('Checking auth session...');
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error checking session:', error);
          throw error;
        }
        
        console.log('Session check result:', !!data.session);
        setSession(data.session);
        setUser(data.session?.user || null);
      } catch (error) {
        console.error('Auth session check error:', error);
        setUser(null);
        setSession(null);
      } finally {
        setLoading(false);
      }
      
      // Set up auth state change listener
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, newSession) => {
          console.log('Auth state changed:', event);
          console.log('New session exists:', !!newSession);
          setSession(newSession);
          setUser(newSession?.user || null);
        }
      );
      
      return () => {
        subscription?.unsubscribe();
      };
    };
    
    checkSession();
  }, [supabase]);

  const value = {
    user,
    session,
    loading,
    signIn: async (email: string, password: string) => {
      setLoading(true);
      try {
        console.log('Signing in...');
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) {
          console.error('Sign in error:', error);
          throw error;
        }
        
        console.log('Sign in successful, session exists:', !!data.session);
        setSession(data.session);
        setUser(data.session?.user || null);
        return data;
      } catch (error) {
        throw error;
      } finally {
        setLoading(false);
      }
    },
    signOut: async () => {
      setLoading(true);
      try {
        console.log('Signing out...');
        const { error } = await supabase.auth.signOut();
        
        if (error) {
          console.error('Sign out error:', error);
          throw error;
        }
        
        console.log('Sign out successful');
        setUser(null);
        setSession(null);
      } finally {
        setLoading(false);
      }
    },
  };

  return (
    <AuthContext.Provider value={value}>
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