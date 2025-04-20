
import { useState } from 'react';
import { Symbol } from '@/contexts/TradeContext';
import { useToast } from '@/components/ui/use-toast';
import { defaultSymbols } from '@/utils/tradeConstants';

export const useSymbolManagement = () => {
  const [symbols, setSymbols] = useState<Symbol[]>(defaultSymbols);
  const { toast } = useToast();

  const addSymbol = (symbol: Symbol) => {
    if (!symbols.some(s => s.symbol === symbol.symbol)) {
      const updatedSymbols = [...symbols, symbol];
      setSymbols(updatedSymbols);
      toast({
        title: "Symbol Added",
        description: `${symbol.name} has been added to your symbols list`,
      });
    }
  };

  const getSymbolPairs = () => symbols.map(symbol => symbol.symbol);

  return {
    symbols,
    addSymbol,
    getSymbolPairs
  };
};
