
import React, { createContext, useContext, useState, useEffect } from 'react';
import { TradingAccount, TradingContextCommon } from '@/types/tradingTypes';
import { useToast } from '@/components/ui/use-toast';
import { userService } from '@/services/userService';
import { useAuth } from './AuthContext';

interface TradingAccountsContextType extends TradingContextCommon {
  tradingAccounts: TradingAccount[];
  createTradingAccount: (name: string, balance: number) => Promise<TradingAccount>;
  fetchTradingAccounts: () => Promise<void>;
  accounts: string[]; // Legacy accounts (to be removed later)
}

// Sample accounts for backwards compatibility
const sampleAccounts = ['Main Trading', 'Demo Account', 'Savings Account'];

const TradingAccountsContext = createContext<TradingAccountsContextType | undefined>(undefined);

export const TradingAccountsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tradingAccounts, setTradingAccounts] = useState<TradingAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchTradingAccounts = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const accounts = await userService.getTradingAccounts(user.id);
      setTradingAccounts(accounts);
      setError(null);
    } catch (err) {
      console.error('Error fetching trading accounts:', err);
      setError("حدث خطأ أثناء جلب الحسابات");
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء جلب الحسابات",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createTradingAccount = async (name: string, balance: number) => {
    if (!user) throw new Error('User not authenticated');

    if (!name.trim()) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال اسم الحساب",
        variant: "destructive"
      });
      throw new Error('Account name is required');
    }

    try {
      setLoading(true);
      const newAccount = await userService.createTradingAccount(user.id, name, balance);
      
      setTradingAccounts(prev => [...prev, newAccount]);
      
      toast({
        title: "حساب جديد",
        description: `تم إنشاء الحساب ${name}`,
      });

      return newAccount;
    } catch (error: any) {
      console.error('Error creating trading account:', error);
      setError("حدث خطأ أثناء إنشاء الحساب");
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إنشاء الحساب",
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchTradingAccounts();
    }
  }, [user]);

  return (
    <TradingAccountsContext.Provider value={{ 
      tradingAccounts,
      createTradingAccount,
      fetchTradingAccounts,
      accounts: sampleAccounts,
      loading,
      error
    }}>
      {children}
    </TradingAccountsContext.Provider>
  );
};

export const useTradingAccounts = () => {
  const context = useContext(TradingAccountsContext);
  if (context === undefined) {
    throw new Error('useTradingAccounts must be used within a TradingAccountsProvider');
  }
  return context;
};
