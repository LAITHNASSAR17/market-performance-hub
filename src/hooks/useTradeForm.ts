import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTrade } from '@/contexts/TradeContext';
import { useAuth } from '@/contexts/AuthContext';
import { Trade } from '@/types/trade';
import { useToast } from '@/hooks/use-toast';
import { calculateProfitLoss, calculateReturnPercentage, calculateRiskPercentage } from '@/utils/tradeUtils';
import { format } from "date-fns";
import { useTradeFormValidation } from './useTradeFormValidation';

export const useTradeForm = (id?: string) => {
  const navigate = useNavigate();
  const { addTrade, updateTrade, getTrade, pairs, addSymbol, tradingAccounts } = useTrade();
  const { user } = useAuth();
  const { toast } = useToast();
  const { validateTradeForm } = useTradeFormValidation();
  const [loading, setLoading] = useState(false);
  const [isAddPairDialogOpen, setIsAddPairDialogOpen] = useState(false);

  const selectedTrade = id ? getTrade(id) : undefined;
  
  const initialTradeData: Omit<Trade, 'id' | 'createdAt'> = selectedTrade ? {
    userId: selectedTrade.userId,
    pair: selectedTrade.pair,
    symbol: selectedTrade.symbol,
    type: selectedTrade.type,
    entry: selectedTrade.entry,
    exit: selectedTrade.exit || 0,
    lotSize: selectedTrade.lotSize,
    stopLoss: selectedTrade.stopLoss || 0,
    takeProfit: selectedTrade.takeProfit || 0,
    riskPercentage: selectedTrade.riskPercentage,
    returnPercentage: selectedTrade.returnPercentage,
    profitLoss: selectedTrade.profitLoss,
    durationMinutes: selectedTrade.durationMinutes || 0,
    notes: selectedTrade.notes,
    date: selectedTrade.date,
    account: selectedTrade.account,
    imageUrl: selectedTrade.imageUrl,
    beforeImageUrl: selectedTrade.beforeImageUrl,
    afterImageUrl: selectedTrade.afterImageUrl,
    hashtags: selectedTrade.hashtags,
    commission: selectedTrade.commission,
    rating: selectedTrade.rating,
    total: selectedTrade.total,
    playbook: selectedTrade.playbook || '',
    followedRules: selectedTrade.followedRules || [],
    marketSession: selectedTrade.marketSession || ''
  } : {
    userId: user?.id || 'demo-user-id',
    pair: pairs[0] || 'EURUSD',
    symbol: pairs[0] || 'EURUSD',
    type: 'Buy',
    entry: 0,
    exit: 0,
    lotSize: 0,
    stopLoss: 0,
    takeProfit: 0,
    riskPercentage: 0,
    returnPercentage: 0,
    profitLoss: 0,
    durationMinutes: 0,
    notes: '',
    date: format(new Date(), "yyyy-MM-dd"),
    account: tradingAccounts[0] || 'Demo',
    imageUrl: null,
    beforeImageUrl: null,
    afterImageUrl: null,
    hashtags: [],
    commission: 0,
    rating: 0,
    total: 0,
    playbook: '',
    followedRules: [],
    marketSession: ''
  };

  const handleAddSymbol = () => {
    setIsAddPairDialogOpen(true);
  };

  const handlePairAdded = (newSymbol: string) => {
    if (newSymbol) {
      addSymbol(newSymbol.toUpperCase());
    }
    setIsAddPairDialogOpen(false);
  };

  const handleSave = async (tradeData: Omit<Trade, 'id' | 'createdAt'>) => {
    if (!validateTradeForm(tradeData)) {
      return;
    }

    try {
      setLoading(true);
      const currentUser = user || { id: 'demo-user-id' };
      
      console.log("Preparing to save trade data:", tradeData);
      
      const finalTradeData: Omit<Trade, 'id' | 'createdAt'> = {
        ...tradeData,
        userId: currentUser.id,
        symbol: tradeData.symbol || tradeData.pair,
        returnPercentage: calculateReturnPercentage(tradeData),
        riskPercentage: calculateRiskPercentage(tradeData),
        profitLoss: calculateProfitLoss(tradeData)
      };
      
      console.log("Final trade data being submitted:", finalTradeData);
    
      if (id && selectedTrade) {
        await updateTrade(selectedTrade.id, finalTradeData);
        toast({
          title: "تم التحديث",
          description: "تم تحديث الصفقة بنجاح"
        });
      } else {
        await addTrade(finalTradeData);
        toast({
          title: "تمت الإضافة",
          description: "تم إضافة الصفقة بنجاح"
        });
      }

      navigate('/trades');
    } catch (error) {
      console.error("Error saving trade:", error);
      toast({
        title: "خطأ",
        description: "فشل في حفظ الصفقة",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    initialTradeData,
    loading,
    pairs,
    tradingAccounts,
    handleAddSymbol,
    handleSave,
    isAddPairDialogOpen,
    setIsAddPairDialogOpen,
    handlePairAdded
  };
};
