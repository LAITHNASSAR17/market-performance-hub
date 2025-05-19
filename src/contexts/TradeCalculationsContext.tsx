
import React, { createContext, useContext } from 'react';
import { TradingContextCommon } from '@/types/tradingTypes';

interface TradeCalculationsContextType extends TradingContextCommon {
  calculateProfitLoss: (
    entry: number, 
    exit: number, 
    lotSize: number, 
    type: 'Buy' | 'Sell',
    instrumentType: string
  ) => number;
}

const TradeCalculationsContext = createContext<TradeCalculationsContextType | undefined>(undefined);

export const TradeCalculationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Implementation of profit/loss calculation function
  const calculateProfitLoss = (
    entry: number, 
    exit: number, 
    lotSize: number, 
    type: 'Buy' | 'Sell',
    instrumentType: string = 'forex'
  ): number => {
    let pipValue = 0;
    let pipMultiplier = 1;
    let contractSize = 100000;

    let detectedType = instrumentType.toLowerCase();
    
    if (!detectedType) {
      if (/\//.test(instrumentType)) {
        detectedType = 'forex';
      } else if (/^(btc|eth|xrp|ada|dot|sol)/i.test(instrumentType)) {
        detectedType = 'crypto';
      } else if (/\.(sr|sa)$/i.test(instrumentType)) {
        detectedType = 'stock';
      } else if (/^(spx|ndx|dji|ftse|tasi)/i.test(instrumentType)) {
        detectedType = 'index';
      } else if (/^(xau|xag|cl|ng)/i.test(instrumentType)) {
        detectedType = 'commodity';
      } else {
        detectedType = 'stock';
      }
    }
    
    switch (detectedType) {
      case 'forex':
        contractSize = 100000;
        
        if (instrumentType.includes('JPY')) {
          pipMultiplier = 0.01;
        } else {
          pipMultiplier = 0.0001;
        }
        
        pipValue = pipMultiplier * contractSize;
        break;
        
      case 'crypto':
        contractSize = 1;
        pipMultiplier = 1;
        pipValue = 1;
        break;
        
      case 'stock':
        contractSize = lotSize;
        pipMultiplier = 1;
        pipValue = 1;
        break;
        
      case 'index':
        contractSize = lotSize;
        pipMultiplier = 1;
        pipValue = 1;
        break;
        
      case 'commodity':
        if (instrumentType.toUpperCase().includes('XAU')) {
          contractSize = 100;
        } else if (instrumentType.toUpperCase().includes('XAG')) {
          contractSize = 50;
        } else {
          contractSize = 1000;
        }
        pipMultiplier = 1;
        pipValue = 1;
        break;
        
      default:
        contractSize = lotSize;
        pipMultiplier = 1;
        pipValue = 1;
    }
    
    const priceDiff = type === 'Buy' 
      ? exit - entry 
      : entry - exit;
    
    const profitLoss = priceDiff * lotSize * contractSize;
    
    return Math.round(profitLoss * 100) / 100;
  };

  return (
    <TradeCalculationsContext.Provider value={{ 
      calculateProfitLoss,
      loading: false,
      error: null
    }}>
      {children}
    </TradeCalculationsContext.Provider>
  );
};

export const useTradeCalculations = () => {
  const context = useContext(TradeCalculationsContext);
  if (context === undefined) {
    throw new Error('useTradeCalculations must be used within a TradeCalculationsProvider');
  }
  return context;
};
