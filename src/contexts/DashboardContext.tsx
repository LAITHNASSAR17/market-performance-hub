
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';

interface DashboardContextType {
  dashboardLayout: any;
  updateDashboardLayout: (newLayout: any) => void;
  isLoading: boolean;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dashboardLayout, setDashboardLayout] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadDashboardLayout();
    } else {
      setDashboardLayout(null);
      setIsLoading(false);
    }
  }, [user]);

  const loadDashboardLayout = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('user_settings')
        .select('dashboard_layout')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        console.error('Error loading dashboard layout:', error);
        setIsLoading(false);
        return;
      }

      if (data?.dashboard_layout) {
        setDashboardLayout(data.dashboard_layout);
      } else {
        // No layout found, use default
        setDashboardLayout(null);
      }
    } catch (error) {
      console.error('Error loading dashboard layout:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateDashboardLayout = async (newLayout: any) => {
    if (!user) return;
    
    try {
      setDashboardLayout(newLayout);
      
      // Check if a record exists for the user
      const { data, error } = await supabase
        .from('user_settings')
        .select('id')
        .eq('user_id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error checking user settings:', error);
        return;
      }
      
      if (data) {
        // Update existing record
        await supabase
          .from('user_settings')
          .update({ dashboard_layout: newLayout })
          .eq('user_id', user.id);
      } else {
        // Create new record
        await supabase
          .from('user_settings')
          .insert({ user_id: user.id, dashboard_layout: newLayout });
      }
    } catch (error) {
      console.error('Error saving dashboard layout:', error);
    }
  };

  return (
    <DashboardContext.Provider value={{ dashboardLayout, updateDashboardLayout, isLoading }}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};
