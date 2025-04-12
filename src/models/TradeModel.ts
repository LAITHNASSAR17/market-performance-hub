import { BaseModel } from './BaseModel';

export interface Trade {
  id: string;
  userId: string;
  account: string;
  date: string;
  pair: string;
  type: 'Buy' | 'Sell';
  entry: number;
  exit: number;
  lotSize: number;
  stopLoss: number | null;
  takeProfit: number | null;
  riskPercentage: number;
  returnPercentage: number;
  profitLoss: number;
  durationMinutes: number;
  notes: string;
  imageUrl: string | null;
  beforeImageUrl: string | null;
  afterImageUrl: string | null;
  instrumentType: 'forex' | 'crypto' | 'stock' | 'index' | 'commodity' | 'other';
  commission: number | null;
  createdAt: Date;
}

export class TradeModel extends BaseModel {
  constructor() {
    super('trades');
  }

  async findById(id: string): Promise<Trade | null> {
    if (!this.validateString(id)) {
      throw new Error('Invalid trade ID');
    }

    return super.findById(id);
  }

  async findByUserId(userId: string, limit?: number, offset?: number): Promise<Trade[]> {
    if (!this.validateString(userId)) {
      throw new Error('Invalid user ID');
    }

    const sql = `SELECT * FROM trades WHERE userId = ? ORDER BY date DESC, createdAt DESC ${
      limit ? `LIMIT ${offset ? `${offset}, ${limit}` : limit}` : ''
    }`;
    
    return this.query(sql, [userId]);
  }

  async create(tradeData: Omit<Trade, 'id' | 'createdAt'>): Promise<string> {
    this.validateTradeData(tradeData);

    const sanitizedData = this.sanitizeObject(tradeData) as Omit<Trade, 'id' | 'createdAt'>;
    
    // Calculate fields if not provided
    if (sanitizedData.profitLoss === undefined) {
      sanitizedData.profitLoss = this.calculateProfitLoss(
        sanitizedData.entry,
        sanitizedData.exit,
        sanitizedData.lotSize,
        sanitizedData.type,
        sanitizedData.instrumentType
      );
    }

    if (sanitizedData.returnPercentage === undefined) {
      sanitizedData.returnPercentage = this.calculateReturnPercentage(
        sanitizedData.entry,
        sanitizedData.exit,
        sanitizedData.type
      );
    }

    // Add current timestamp for createdAt
    const dataToInsert = {
      ...sanitizedData,
      createdAt: new Date().toISOString().slice(0, 19).replace('T', ' ')
    };

    // Construct SQL query
    const columns = Object.keys(dataToInsert).join(', ');
    const placeholders = Object.keys(dataToInsert).map(() => '?').join(', ');
    const values = Object.values(dataToInsert);
    
    const sql = `INSERT INTO trades (${columns}) VALUES (${placeholders})`;
    const result = await this.query(sql, values);
    
    // Extract insertId from MongoDB-compatible result
    return result.length > 0 && result[0].insertId ? result[0].insertId.toString() : Date.now().toString();
  }

  async update(id: string, tradeData: Partial<Trade>): Promise<boolean> {
    if (!this.validateString(id)) {
      throw new Error('Invalid trade ID');
    }

    // Partial validation of trade data
    this.validatePartialTradeData(tradeData);

    const sanitizedData = this.sanitizeObject(tradeData) as Partial<Trade>;
    
    // Recalculate profitLoss and returnPercentage if relevant fields changed
    if (
      (tradeData.entry !== undefined || 
      tradeData.exit !== undefined || 
      tradeData.lotSize !== undefined || 
      tradeData.type !== undefined ||
      tradeData.instrumentType !== undefined) &&
      !(tradeData.profitLoss !== undefined)
    ) {
      // Get the current trade to use any unchanged values
      const currentTrade = await this.findById(id);
      if (currentTrade) {
        const entry = tradeData.entry ?? currentTrade.entry;
        const exit = tradeData.exit ?? currentTrade.exit;
        const lotSize = tradeData.lotSize ?? currentTrade.lotSize;
        const type = tradeData.type ?? currentTrade.type;
        const instrumentType = tradeData.instrumentType ?? currentTrade.instrumentType;
        
        sanitizedData.profitLoss = this.calculateProfitLoss(entry, exit, lotSize, type, instrumentType);
        sanitizedData.returnPercentage = this.calculateReturnPercentage(entry, exit, type);
      }
    }

    // Build SQL for update
    const updateFields: string[] = [];
    const values: any[] = [];

    Object.entries(sanitizedData).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'createdAt' && key !== 'userId') {
        updateFields.push(`${key} = ?`);
        values.push(value);
      }
    });

    if (updateFields.length === 0) {
      return true; // Nothing to update
    }

    values.push(id); // Add ID for WHERE clause
    const sql = `UPDATE trades SET ${updateFields.join(', ')} WHERE id = ?`;
    const result = await this.query(sql, values);

    return result.length > 0 && result[0].affectedRows > 0;
  }

  async delete(id: string): Promise<boolean> {
    if (!this.validateString(id)) {
      throw new Error('Invalid trade ID');
    }

    return super.delete(id);
  }

  async getTradesByAccount(userId: string, account: string): Promise<Trade[]> {
    if (!this.validateString(userId) || !this.validateString(account)) {
      throw new Error('Invalid parameters');
    }

    const sql = 'SELECT * FROM trades WHERE userId = ? AND account = ? ORDER BY date DESC, createdAt DESC';
    return this.query(sql, [userId, account]);
  }

  async getTradesByPair(userId: string, pair: string): Promise<Trade[]> {
    if (!this.validateString(userId) || !this.validateString(pair)) {
      throw new Error('Invalid parameters');
    }

    const sql = 'SELECT * FROM trades WHERE userId = ? AND pair = ? ORDER BY date DESC, createdAt DESC';
    return this.query(sql, [userId, pair]);
  }

  async getTradesByDateRange(userId: string, startDate: string, endDate: string): Promise<Trade[]> {
    if (!this.validateString(userId) || !this.validateDate(startDate) || !this.validateDate(endDate)) {
      throw new Error('Invalid parameters');
    }

    const sql = 'SELECT * FROM trades WHERE userId = ? AND date BETWEEN ? AND ? ORDER BY date DESC, createdAt DESC';
    return this.query(sql, [userId, startDate, endDate]);
  }

  async getUserTradingPairs(userId: string): Promise<string[]> {
    if (!this.validateString(userId)) {
      throw new Error('Invalid user ID');
    }

    const sql = 'SELECT DISTINCT pair FROM trades WHERE userId = ?';
    const results = await this.query(sql, [userId]);
    return results.map((row: any) => row.pair);
  }

  async getUserAccounts(userId: string): Promise<string[]> {
    if (!this.validateString(userId)) {
      throw new Error('Invalid user ID');
    }

    const sql = 'SELECT DISTINCT account FROM trades WHERE userId = ?';
    const results = await this.query(sql, [userId]);
    return results.map((row: any) => row.account);
  }

  // Helper method to calculate profit/loss
  private calculateProfitLoss(
    entry: number, 
    exit: number, 
    lotSize: number, 
    type: 'Buy' | 'Sell',
    instrumentType: string
  ): number {
    // Base calculation
    let pipValue = 0;
    let pipMultiplier = 1;
    let contractSize = 100000; // Default for forex

    // Determine settings based on instrument type
    switch (instrumentType) {
      case 'forex':
        contractSize = 100000; // Standard lot size
        pipMultiplier = 0.0001;
        break;
      case 'crypto':
        contractSize = 1;
        pipMultiplier = 1;
        break;
      case 'stock':
        contractSize = lotSize;
        pipMultiplier = 1;
        break;
      case 'index':
        contractSize = lotSize;
        pipMultiplier = 1;
        break;
      case 'commodity':
        contractSize = 100; // Default
        pipMultiplier = 1;
        break;
      default:
        contractSize = lotSize;
        pipMultiplier = 1;
    }

    // Calculate price difference based on trade type
    const priceDiff = type === 'Buy' ? exit - entry : entry - exit;
    
    // Calculate total profit/loss
    const profitLoss = priceDiff * lotSize * contractSize;
    
    return Math.round(profitLoss * 100) / 100; // Round to 2 decimal places
  }

  // Helper method to calculate return percentage
  private calculateReturnPercentage(entry: number, exit: number, type: 'Buy' | 'Sell'): number {
    const priceDiff = type === 'Buy' ? exit - entry : entry - exit;
    const returnPerc = (priceDiff / entry) * 100;
    return Math.round(returnPerc * 100) / 100; // Round to 2 decimal places
  }

  private validateTradeData(data: Omit<Trade, 'id' | 'createdAt'>): void {
    if (!this.validateString(data.userId)) {
      throw new Error('Invalid user ID');
    }
    if (!this.validateString(data.account)) {
      throw new Error('Invalid account name');
    }
    if (!this.validateDate(data.date)) {
      throw new Error('Invalid date');
    }
    if (!this.validateString(data.pair)) {
      throw new Error('Invalid pair');
    }
    if (data.type !== 'Buy' && data.type !== 'Sell') {
      throw new Error('Invalid trade type');
    }
    if (!this.validateNumber(data.entry) || data.entry <= 0) {
      throw new Error('Invalid entry price');
    }
    if (!this.validateNumber(data.exit) || data.exit <= 0) {
      throw new Error('Invalid exit price');
    }
    if (!this.validateNumber(data.lotSize) || data.lotSize <= 0) {
      throw new Error('Invalid lot size');
    }
    // stopLoss and takeProfit can be null
    if (data.stopLoss && (!this.validateNumber(data.stopLoss) || data.stopLoss <= 0)) {
      throw new Error('Invalid stop loss');
    }
    if (data.takeProfit && (!this.validateNumber(data.takeProfit) || data.takeProfit <= 0)) {
      throw new Error('Invalid take profit');
    }
  }

  private validatePartialTradeData(data: Partial<Trade>): void {
    if (data.userId !== undefined && !this.validateString(data.userId)) {
      throw new Error('Invalid user ID');
    }
    if (data.account !== undefined && !this.validateString(data.account)) {
      throw new Error('Invalid account name');
    }
    if (data.date !== undefined && !this.validateDate(data.date)) {
      throw new Error('Invalid date');
    }
    if (data.pair !== undefined && !this.validateString(data.pair)) {
      throw new Error('Invalid pair');
    }
    if (data.type !== undefined && data.type !== 'Buy' && data.type !== 'Sell') {
      throw new Error('Invalid trade type');
    }
    if (data.entry !== undefined && (!this.validateNumber(data.entry) || data.entry <= 0)) {
      throw new Error('Invalid entry price');
    }
    if (data.exit !== undefined && (!this.validateNumber(data.exit) || data.exit <= 0)) {
      throw new Error('Invalid exit price');
    }
    if (data.lotSize !== undefined && (!this.validateNumber(data.lotSize) || data.lotSize <= 0)) {
      throw new Error('Invalid lot size');
    }
    if (data.stopLoss !== undefined && data.stopLoss !== null && (!this.validateNumber(data.stopLoss) || data.stopLoss <= 0)) {
      throw new Error('Invalid stop loss');
    }
    if (data.takeProfit !== undefined && data.takeProfit !== null && (!this.validateNumber(data.takeProfit) || data.takeProfit <= 0)) {
      throw new Error('Invalid take profit');
    }
  }
}
