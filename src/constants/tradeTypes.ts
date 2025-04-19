
export const TRADE_TYPES = {
  BUY: "Buy",
  SELL: "Sell"
} as const;

export type TradeType = typeof TRADE_TYPES[keyof typeof TRADE_TYPES];
