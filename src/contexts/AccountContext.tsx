
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './AuthContext';

export type TradingAccount = {
  id: string;
  userId: string;
  name: string;
  balance: number;
  currency: string;
  broker: string;
  type: 'Demo' | 'Live' | 'Other';
  createdAt: string;
  updatedAt: string;
  description?: string;
  isActive: boolean;
  initialBalance: number;
  tradingPairs?: string[];
  leverage?: number;
};

type AccountContextType = {
  accounts: TradingAccount[];
  getAccountById: (id: string) => TradingAccount | undefined;
  getUserAccounts: () => TradingAccount[];
  addAccount: (account: Omit<TradingAccount, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void;
  updateAccount: (id: string, accountData: Partial<TradingAccount>) => void;
  deleteAccount: (id: string) => void;
  loading: boolean;
};

const AccountContext = createContext<AccountContextType | undefined>(undefined);

// Sample demo accounts
const sampleAccounts: TradingAccount[] = [
  {
    id: '1',
    userId: 'admin-1',
    name: 'Demo Forex Account',
    balance: 10000,
    currency: 'USD',
    broker: 'Demo Broker',
    type: 'Demo',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    description: 'Demo forex trading account for testing',
    isActive: true,
    initialBalance: 10000,
    tradingPairs: ['EUR/USD', 'GBP/USD', 'USD/JPY'],
    leverage: 100
  },
  {
    id: '2',
    userId: 'admin-1',
    name: 'Live Trading Account',
    balance: 5000,
    currency: 'USD',
    broker: 'IC Markets',
    type: 'Live',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    description: 'Primary trading account',
    isActive: true,
    initialBalance: 5000,
    tradingPairs: ['EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD'],
    leverage: 30
  },
  {
    id: '3',
    userId: 'admin-1',
    name: 'Crypto Trading Account',
    balance: 2000,
    currency: 'USD',
    broker: 'Binance',
    type: 'Live',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    description: 'Account for cryptocurrency trading',
    isActive: true,
    initialBalance: 2000,
    tradingPairs: ['BTC/USD', 'ETH/USD', 'XRP/USD'],
    leverage: 10
  },
  {
    id: '4',
    userId: 'admin-1',
    name: 'Options Trading Account',
    balance: 15000,
    currency: 'USD',
    broker: 'Interactive Brokers',
    type: 'Live',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    description: 'Account for options trading',
    isActive: true,
    initialBalance: 15000,
    tradingPairs: ['SPY', 'QQQ', 'AAPL', 'MSFT'],
    leverage: 1
  }
];

export const AccountProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [accounts, setAccounts] = useState<TradingAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      // Load accounts from localStorage
      const storedAccounts = localStorage.getItem('tradingAccounts');
      
      if (storedAccounts) {
        const parsedAccounts = JSON.parse(storedAccounts);
        setAccounts(parsedAccounts);
      } else {
        // If no accounts exist yet, add sample accounts for admin
        if (user.isAdmin) {
          localStorage.setItem('tradingAccounts', JSON.stringify(sampleAccounts));
          setAccounts(sampleAccounts);
        }
      }
    } else {
      setAccounts([]);
    }
    
    setLoading(false);
  }, [user]);

  const getUserAccounts = (): TradingAccount[] => {
    if (!user) return [];
    return accounts.filter(account => account.userId === user.id);
  };

  const getAccountById = (id: string): TradingAccount | undefined => {
    return accounts.find(account => account.id === id);
  };

  const addAccount = (accountData: Omit<TradingAccount, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;

    const now = new Date().toISOString();
    const newAccount: TradingAccount = {
      ...accountData,
      id: Date.now().toString(),
      userId: user.id,
      createdAt: now,
      updatedAt: now
    };

    const updatedAccounts = [...accounts, newAccount];
    setAccounts(updatedAccounts);
    localStorage.setItem('tradingAccounts', JSON.stringify(updatedAccounts));

    toast({
      title: "Account Added",
      description: "Your trading account has been added successfully",
    });
  };

  const updateAccount = (id: string, accountData: Partial<TradingAccount>) => {
    const accountIndex = accounts.findIndex(acc => acc.id === id);
    
    if (accountIndex === -1) {
      toast({
        title: "Error",
        description: "Account not found",
        variant: "destructive",
      });
      return;
    }
    
    const updatedAccount = {
      ...accounts[accountIndex],
      ...accountData,
      updatedAt: new Date().toISOString()
    };
    
    const updatedAccounts = [...accounts];
    updatedAccounts[accountIndex] = updatedAccount;
    
    setAccounts(updatedAccounts);
    localStorage.setItem('tradingAccounts', JSON.stringify(updatedAccounts));
    
    toast({
      title: "Account Updated",
      description: "Trading account has been updated successfully",
    });
  };

  const deleteAccount = (id: string) => {
    const updatedAccounts = accounts.filter(acc => acc.id !== id);
    setAccounts(updatedAccounts);
    localStorage.setItem('tradingAccounts', JSON.stringify(updatedAccounts));
    
    toast({
      title: "Account Deleted",
      description: "Trading account has been deleted successfully",
    });
  };

  return (
    <AccountContext.Provider value={{
      accounts,
      getAccountById,
      getUserAccounts,
      addAccount,
      updateAccount,
      deleteAccount,
      loading
    }}>
      {children}
    </AccountContext.Provider>
  );
};

export const useAccount = () => {
  const context = useContext(AccountContext);
  if (context === undefined) {
    throw new Error('useAccount must be used within an AccountProvider');
  }
  return context;
};
