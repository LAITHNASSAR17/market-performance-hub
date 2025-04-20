
import { useToast } from "@/hooks/use-toast";
import { Trade } from "@/types/trade";

export const useTradeFormValidation = () => {
  const { toast } = useToast();

  const validateTradeForm = (tradeData: Omit<Trade, 'id' | 'createdAt'>) => {
    if (!tradeData.pair || !tradeData.type || !tradeData.entry || !tradeData.lotSize) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive"
      });
      return false;
    }
    return true;
  };

  return { validateTradeForm };
};
