import { BaseModel } from './BaseModel';

export interface AnalyticsData {
  id: number;
  userId: number;
  date: Date;
  metricType: string;
  metricName: string;
  metricValue: number;
  additionalData: string; // JSON string containing any additional data
  createdAt: Date;
}

export interface TradingStat {
  name: string;
  value: number;
  change?: number;
  changeType?: 'positive' | 'negative' | 'neutral';
}

export class AnalyticsModel extends BaseModel {
  constructor() {
    super('analytics_data');
  }

  // Get analytics data for a user
  async getUserAnalytics(userId: number, metricType?: string): Promise<AnalyticsData[]> {
    let sql = "SELECT * FROM analytics_data WHERE userId = ?";
    const params: any[] = [userId];
    
    if (metricType) {
      sql += " AND metricType = ?";
      params.push(metricType);
    }
    
    sql += " ORDER BY date DESC";
    
    return this.query(sql, params);
  }

  // Get specific metric data
  async getMetricData(userId: number, metricName: string, startDate?: Date, endDate?: Date): Promise<AnalyticsData[]> {
    let sql = "SELECT * FROM analytics_data WHERE userId = ? AND metricName = ?";
    const params: any[] = [userId, metricName];
    
    if (startDate) {
      sql += " AND date >= ?";
      params.push(startDate.toISOString());
    }
    
    if (endDate) {
      sql += " AND date <= ?";
      params.push(endDate.toISOString());
    }
    
    sql += " ORDER BY date ASC";
    
    return this.query(sql, params);
  }

  // Record a new metric data point
  async recordMetric(data: Omit<AnalyticsData, 'id' | 'createdAt'>): Promise<number> {
    // Sanitize input
    const sanitizedData = this.sanitizeObject(data);
    
    // Add created timestamp
    const dataWithTimestamp = {
      ...sanitizedData,
      createdAt: new Date()
    };
    
    return this.create(dataWithTimestamp);
  }

  // Delete metric data
  async deleteMetricData(id: number, userId: number): Promise<boolean> {
    const sql = "DELETE FROM analytics_data WHERE id = ? AND userId = ?";
    const result = await this.query(sql, [id, userId]);
    return result.affectedRows > 0;
  }

  // Calculate key trading statistics
  async calculateTradingStats(userId: number): Promise<TradingStat[]> {
    const currentMonth = new Date();
    const previousMonth = new Date();
    previousMonth.setMonth(previousMonth.getMonth() - 1);
    
    // Format dates for SQL query
    const currentMonthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const previousMonthStart = new Date(previousMonth.getFullYear(), previousMonth.getMonth(), 1);
    const previousMonthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 0);
    
    // Get current month stats
    const currentMonthStats = await this.getMonthlyTradingStats(userId, currentMonthStart);
    
    // Get previous month stats
    const previousMonthStats = await this.getMonthlyTradingStats(userId, previousMonthStart, previousMonthEnd);
    
    // Calculate changes
    const stats: TradingStat[] = [];
    
    // Total profit/loss
    const currentPL = currentMonthStats.totalProfitLoss || 0;
    const previousPL = previousMonthStats.totalProfitLoss || 0;
    const plChange = previousPL !== 0 ? ((currentPL - previousPL) / Math.abs(previousPL)) * 100 : (currentPL > 0 ? 100 : 0);
    
    stats.push({
      name: 'Total P&L',
      value: currentPL,
      change: parseFloat(plChange.toFixed(2)),
      changeType: plChange > 0 ? 'positive' : plChange < 0 ? 'negative' : 'neutral'
    });
    
    // Win rate
    const currentWinRate = currentMonthStats.totalTrades > 0 ? 
      (currentMonthStats.winningTrades / currentMonthStats.totalTrades) * 100 : 0;
    const previousWinRate = previousMonthStats.totalTrades > 0 ? 
      (previousMonthStats.winningTrades / previousMonthStats.totalTrades) * 100 : 0;
    const winRateChange = previousWinRate !== 0 ? 
      currentWinRate - previousWinRate : (currentWinRate > 0 ? currentWinRate : 0);
    
    stats.push({
      name: 'Win Rate',
      value: parseFloat(currentWinRate.toFixed(2)),
      change: parseFloat(winRateChange.toFixed(2)),
      changeType: winRateChange > 0 ? 'positive' : winRateChange < 0 ? 'negative' : 'neutral'
    });
    
    // Average trade
    const currentAvgTrade = currentMonthStats.totalTrades > 0 ? 
      currentMonthStats.totalProfitLoss / currentMonthStats.totalTrades : 0;
    const previousAvgTrade = previousMonthStats.totalTrades > 0 ? 
      previousMonthStats.totalProfitLoss / previousMonthStats.totalTrades : 0;
    const avgTradeChange = previousAvgTrade !== 0 ? 
      ((currentAvgTrade - previousAvgTrade) / Math.abs(previousAvgTrade)) * 100 : (currentAvgTrade > 0 ? 100 : 0);
    
    stats.push({
      name: 'Average Trade',
      value: parseFloat(currentAvgTrade.toFixed(2)),
      change: parseFloat(avgTradeChange.toFixed(2)),
      changeType: avgTradeChange > 0 ? 'positive' : avgTradeChange < 0 ? 'negative' : 'neutral'
    });
    
    // Trade count
    const tradeCountChange = previousMonthStats.totalTrades !== 0 ? 
      ((currentMonthStats.totalTrades - previousMonthStats.totalTrades) / previousMonthStats.totalTrades) * 100 : 
      (currentMonthStats.totalTrades > 0 ? 100 : 0);
    
    stats.push({
      name: 'Trade Count',
      value: currentMonthStats.totalTrades,
      change: parseFloat(tradeCountChange.toFixed(2)),
      changeType: tradeCountChange > 0 ? 'positive' : tradeCountChange < 0 ? 'negative' : 'neutral'
    });
    
    return stats;
  }

  // Helper method to get monthly trading stats
  private async getMonthlyTradingStats(userId: number, startDate: Date, endDate?: Date): Promise<any> {
    let sql = `
      SELECT 
        COUNT(*) as totalTrades,
        SUM(CASE WHEN profitLoss > 0 THEN 1 ELSE 0 END) as winningTrades,
        SUM(CASE WHEN profitLoss <= 0 THEN 1 ELSE 0 END) as losingTrades,
        SUM(profitLoss) as totalProfitLoss
      FROM trades
      WHERE userId = ? AND entryDate >= ?
    `;
    
    const params: any[] = [userId, startDate.toISOString()];
    
    if (endDate) {
      sql += " AND entryDate <= ?";
      params.push(endDate.toISOString());
    }
    
    const results = await this.query(sql, params);
    return results[0] || {
      totalTrades: 0,
      winningTrades: 0,
      losingTrades: 0,
      totalProfitLoss: 0
    };
  }

  // Get profit/loss time series data
  async getProfitLossTimeSeries(userId: number, startDate: Date, endDate: Date, groupBy: 'day' | 'week' | 'month' = 'day'): Promise<any[]> {
    let dateFormat;
    let groupByClause;
    
    // Set SQL formatting based on groupBy parameter
    switch (groupBy) {
      case 'day':
        dateFormat = '%Y-%m-%d';
        groupByClause = 'DATE(entryDate)';
        break;
      case 'week':
        dateFormat = '%Y-%u';
        groupByClause = 'YEARWEEK(entryDate)';
        break;
      case 'month':
        dateFormat = '%Y-%m';
        groupByClause = 'DATE_FORMAT(entryDate, "%Y-%m")';
        break;
    }
    
    const sql = `
      SELECT 
        ${groupByClause} as groupDate,
        DATE_FORMAT(MIN(entryDate), '${dateFormat}') as dateLabel,
        SUM(profitLoss) as totalProfitLoss,
        COUNT(*) as tradeCount
      FROM trades
      WHERE userId = ? AND entryDate >= ? AND entryDate <= ?
      GROUP BY groupDate
      ORDER BY groupDate ASC
    `;
    
    return this.query(sql, [userId, startDate, endDate]);
  }

  // Get tag performance data
  async getTagPerformance(userId: number): Promise<any[]> {
    const sql = `
      SELECT 
        t.id, 
        t.name, 
        t.type,
        COUNT(tr.id) as tradeCount,
        SUM(tr.profitLoss) as totalProfitLoss,
        AVG(tr.profitLoss) as avgProfitLoss,
        (SUM(CASE WHEN tr.profitLoss > 0 THEN 1 ELSE 0 END) / COUNT(tr.id)) * 100 as winRate
      FROM tags t
      JOIN trade_tags tt ON t.id = tt.tagId
      JOIN trades tr ON tt.tradeId = tr.id
      WHERE t.userId = ?
      GROUP BY t.id, t.name, t.type
      ORDER BY totalProfitLoss DESC
    `;
    
    return this.query(sql, [userId]);
  }
}
