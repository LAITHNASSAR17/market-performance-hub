
import React from 'react';
import { TradeProvider } from './TradeContext';
import { SymbolsProvider } from './SymbolsContext';
import { HashtagsProvider } from './HashtagsContext';
import { TradingAccountsProvider } from './TradingAccountsContext'; 
import { TradeCalculationsProvider } from './TradeCalculationsContext';

export const TradingProvidersWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <SymbolsProvider>
      <HashtagsProvider>
        <TradeCalculationsProvider>
          <TradingAccountsProvider>
            <TradeProvider>
              {children}
            </TradeProvider>
          </TradingAccountsProvider>
        </TradeCalculationsProvider>
      </HashtagsProvider>
    </SymbolsProvider>
  );
};

export default TradingProvidersWrapper;
