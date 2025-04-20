
import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { userService } from '@/services/userService';
import { TradingAccount } from '@/contexts/TradeContext';
import { useAuth } from '@/contexts/AuthContext';

export const useTradingAccounts = () => {
  const [tradingAccounts, setTradingAccounts] = useState<TradingAccount[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchTradingAccounts = async () => {
    if (!user) return;

    try {
      const accounts = await userService.getTradingAccounts(user.id);
      setTradingAccounts(accounts);
    } catch (error) {
      console.error('Error fetching trading accounts:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء جلب الحسابات",
        variant: "destructive"
      });
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
      const newAccount = await userService.createTradingAccount(user.id, name, balance);
      setTradingAccounts(prev => [...prev, newAccount]);
      toast({
        title: "حساب جديد",
        description: `تم إنشاء الحساب ${name}`,
      });
      return newAccount;
    } catch (error: any) {
      console.error('Error creating trading account:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إنشاء الحساب",
        variant: "destructive"
      });
      throw error;
    }
  };

  useEffect(() => {
    if (user) {
      fetchTradingAccounts();
    }
  }, [user]);

  return {
    tradingAccounts,
    createTradingAccount,
    fetchTradingAccounts
  };
};
