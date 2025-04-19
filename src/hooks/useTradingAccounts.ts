
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { userService } from '@/services/userService';
import { TradingAccount } from '@/types/tradingTypes';

export const useTradingAccounts = (userId: string | undefined) => {
  const [tradingAccounts, setTradingAccounts] = useState<TradingAccount[]>([]);
  const { toast } = useToast();

  const fetchTradingAccounts = async () => {
    if (!userId) return;

    try {
      const accounts = await userService.getTradingAccounts(userId);
      const convertedAccounts: TradingAccount[] = accounts.map(acc => ({
        ...acc,
        currency: 'USD'
      }));
      setTradingAccounts(convertedAccounts);
    } catch (error) {
      console.error('Error fetching trading accounts:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء جلب الحسابات",
        variant: "destructive"
      });
    }
  };

  const createTradingAccount = async (name: string, balance: number): Promise<TradingAccount> => {
    if (!userId) throw new Error('User not authenticated');

    if (!name.trim()) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال اسم الحساب",
        variant: "destructive"
      });
      throw new Error('Account name is required');
    }

    try {
      const newAccount = await userService.createTradingAccount(userId, name, balance);
      const convertedAccount: TradingAccount = {
        ...newAccount,
        currency: 'USD'
      };
      
      setTradingAccounts(prev => [...prev, convertedAccount]);
      
      toast({
        title: "حساب جديد",
        description: `تم إنشاء الحساب ${name}`,
      });
      return convertedAccount;
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

  return {
    tradingAccounts,
    fetchTradingAccounts,
    createTradingAccount
  };
};
