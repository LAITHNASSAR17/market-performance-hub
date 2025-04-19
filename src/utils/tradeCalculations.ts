
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
      pipMultiplier = instrumentType.includes('JPY') ? 0.01 : 0.0001;
      pipValue = pipMultiplier * contractSize;
      break;
    case 'crypto':
      contractSize = 1;
      pipMultiplier = 1;
      pipValue = 1;
      break;
    case 'stock':
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
  
  const priceDiff = type === 'Buy' ? exit - entry : entry - exit;
  return Math.round(priceDiff * lotSize * contractSize * 100) / 100;
};
