
import React, { createContext, useContext, useState } from 'react';
import { Symbol, TradingContextCommon } from '@/types/tradingTypes';
import { useToast } from '@/components/ui/use-toast';

// Default symbols to initialize the context with
const defaultSymbols: Symbol[] = [
  { symbol: 'EUR/USD', name: 'Euro / US Dollar', type: 'forex' },
  { symbol: 'GBP/USD', name: 'British Pound / US Dollar', type: 'forex' },
  { symbol: 'USD/JPY', name: 'US Dollar / Japanese Yen', type: 'forex' },
  { symbol: 'AUD/USD', name: 'Australian Dollar / US Dollar', type: 'forex' },
  { symbol: 'USD/CAD', name: 'US Dollar / Canadian Dollar', type: 'forex' },
  { symbol: 'NZD/USD', name: 'New Zealand Dollar / US Dollar', type: 'forex' },
  { symbol: 'EUR/GBP', name: 'Euro / British Pound', type: 'forex' },
  { symbol: 'USD/CHF', name: 'US Dollar / Swiss Franc', type: 'forex' },
  
  { symbol: 'BTC/USD', name: 'Bitcoin / US Dollar', type: 'crypto' },
  { symbol: 'ETH/USD', name: 'Ethereum / US Dollar', type: 'crypto' },
  { symbol: 'XRP/USD', name: 'Ripple / US Dollar', type: 'crypto' },
  { symbol: 'LTC/USD', name: 'Litecoin / US Dollar', type: 'crypto' },
  { symbol: 'ADA/USD', name: 'Cardano / US Dollar', type: 'crypto' },
  
  { symbol: 'AAPL', name: 'Apple Inc.', type: 'stock' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', type: 'stock' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', type: 'stock' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', type: 'stock' },
  { symbol: 'META', name: 'Meta Platforms Inc.', type: 'stock' },
  { symbol: 'TSLA', name: 'Tesla Inc.', type: 'stock' },
  
  { symbol: '2222.SR', name: 'Saudi Aramco', type: 'stock' },
  { symbol: '1120.SR', name: 'Al Rajhi Bank', type: 'stock' },
  { symbol: '2010.SR', name: 'Saudi Basic Industries Corp', type: 'stock' },
  
  { symbol: 'SPX', name: 'S&P 500', type: 'index' },
  { symbol: 'NDX', name: 'Nasdaq 100', type: 'index' },
  { symbol: 'TASI', name: 'Tadawul All Share Index', type: 'index' },
  
  { symbol: 'XAUUSD', name: 'Gold', type: 'commodity' },
  { symbol: 'XAGUSD', name: 'Silver', type: 'commodity' },
  { symbol: 'CL', name: 'Crude Oil', type: 'commodity' }
];

interface SymbolsContextType extends TradingContextCommon {
  symbols: Symbol[];
  pairs: string[];
  addSymbol: (symbol: Symbol) => void;
}

const SymbolsContext = createContext<SymbolsContextType | undefined>(undefined);

export const SymbolsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [symbols, setSymbols] = useState<Symbol[]>(defaultSymbols);
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Convert symbols to simple pair strings
  const pairs = symbols.map(symbol => symbol.symbol);

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

  return (
    <SymbolsContext.Provider value={{ 
      symbols, 
      pairs,
      addSymbol,
      loading,
      error
    }}>
      {children}
    </SymbolsContext.Provider>
  );
};

export const useSymbols = () => {
  const context = useContext(SymbolsContext);
  if (context === undefined) {
    throw new Error('useSymbols must be used within a SymbolsProvider');
  }
  return context;
};
