import { Symbol } from '@/contexts/TradeContext';

export const defaultSymbols: Symbol[] = [
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

export const sampleAccounts = ['Main Trading', 'Demo Account', 'Savings Account'];

export const calculateProfitLoss = (
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
