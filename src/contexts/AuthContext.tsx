
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { User } from '@/types/settings';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  supabase: typeof supabase;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  sendPasswordResetEmail: (email: string) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  updateSubscriptionTier: (userId: string, tier: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchUserProfile(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchUserProfile(session.user.id);
      else setUser(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setUser(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast({ title: "Success", description: "Successfully signed in" });
    } catch (error) {
      console.error('Error signing in:', error);
      toast({ title: "Error", description: "Failed to sign in", variant: "destructive" });
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      toast({ title: "Success", description: "Successfully signed up" });
    } catch (error) {
      console.error('Error signing up:', error);
      toast({ title: "Error", description: "Failed to sign up", variant: "destructive" });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast({ title: "Success", description: "Successfully signed out" });
    } catch (error) {
      console.error('Error signing out:', error);
      toast({ title: "Error", description: "Failed to sign out", variant: "destructive" });
      throw error;
    }
  };

  const sendPasswordResetEmail = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      toast({ title: "Success", description: "Password reset email sent" });
    } catch (error) {
      console.error('Error sending reset email:', error);
      toast({ title: "Error", description: "Failed to send reset email", variant: "destructive" });
      throw error;
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', session?.user.id);

      if (error) throw error;
      
      if (user) setUser({ ...user, ...data });
      toast({ title: "Success", description: "Profile updated successfully" });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({ title: "Error", description: "Failed to update profile", variant: "destructive" });
      throw error;
    }
  };

  const updateSubscriptionTier = async (userId: string, tier: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ subscription_tier: tier })
        .eq('id', userId);

      if (error) throw error;
      toast({ title: "Success", description: "Subscription updated successfully" });
    } catch (error) {
      console.error('Error updating subscription:', error);
      toast({ title: "Error", description: "Failed to update subscription", variant: "destructive" });
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{
      session,
      user,
      supabase,
      signIn,
      signUp,
      signOut,
      sendPasswordResetEmail,
      updateProfile,
      updateSubscriptionTier
    }}>
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
