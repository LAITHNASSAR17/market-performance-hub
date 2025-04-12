
import { BaseModel } from './BaseModel';

export interface ChartData {
  id: number;
  userId: number;
  chartType: string;
  chartName: string;
  settings: string; // JSON string containing chart settings
  createdAt: Date;
  updatedAt: Date;
}

export interface ChartDataPoint {
  date: Date | string;
  value: number;
  label?: string;
}

export class ChartModel extends BaseModel {
  constructor() {
    super('chart_settings');
  }

  // Get all chart settings for a user
  async getUserCharts(userId: number): Promise<ChartData[]> {
    const sql = "SELECT * FROM chart_settings WHERE userId = ?";
    return this.query(sql, [userId]);
  }

  // Get chart by ID
  async getChartById(id: number, userId: number): Promise<ChartData | null> {
    const sql = "SELECT * FROM chart_settings WHERE id = ? AND userId = ?";
    const results = await this.query(sql, [id, userId]);
    return results.length > 0 ? results[0] : null;
  }

  // Create or update chart settings
  async saveChartSettings(chartData: Omit<ChartData, 'id' | 'createdAt' | 'updatedAt'>): Promise<number> {
    // Sanitize input
    const sanitizedData = this.sanitizeObject(chartData);
    
    // Check if chart already exists
    const sql = "SELECT id FROM chart_settings WHERE userId = ? AND chartName = ?";
    const existing = await this.query(sql, [chartData.userId, chartData.chartName]);
    
    const now = new Date();
    
    if (existing.length > 0) {
      // Update existing
      const updateSql = "UPDATE chart_settings SET chartType = ?, settings = ?, updatedAt = ? WHERE id = ?";
      await this.query(updateSql, [chartData.chartType, chartData.settings, now, existing[0].id]);
      return existing[0].id;
    } else {
      // Create new
      const dataWithTimestamps = {
        ...sanitizedData,
        createdAt: now,
        updatedAt: now
      };
      
      return this.create(dataWithTimestamps);
    }
  }

  // Delete chart settings
  async deleteChartSettings(id: number, userId: number): Promise<boolean> {
    const sql = "DELETE FROM chart_settings WHERE id = ? AND userId = ?";
    const result = await this.query(sql, [id, userId]);
    return result.affectedRows > 0;
  }

  // Get P&L data by day for charting
  async getProfitLossByDay(userId: number, startDate?: Date, endDate?: Date): Promise<ChartDataPoint[]> {
    let sql = `
      SELECT 
        DATE(entryDate) as date,
        SUM(profitLoss) as value
      FROM trades
      WHERE userId = ?
    `;
    
    const params: any[] = [userId];
    
    if (startDate) {
      sql += " AND entryDate >= ?";
      params.push(startDate.toISOString());
    }
    
    if (endDate) {
      sql += " AND entryDate <= ?";
      params.push(endDate.toISOString());
    }
    
    sql += " GROUP BY DATE(entryDate) ORDER BY date ASC";
    
    return this.query(sql, params);
  }

  // Get cumulative P&L data for charting
  async getCumulativeProfitLoss(userId: number, startDate?: Date, endDate?: Date): Promise<ChartDataPoint[]> {
    // First get P&L by day
    const dailyPL = await this.getProfitLossByDay(userId, startDate, endDate);
    
    // Calculate cumulative sum
    let cumulativeSum = 0;
    return dailyPL.map(point => {
      cumulativeSum += point.value;
      return {
        date: point.date,
        value: cumulativeSum
      };
    });
  }

  // Get trade count by day for charting
  async getTradeCountByDay(userId: number, startDate?: Date, endDate?: Date): Promise<ChartDataPoint[]> {
    let sql = `
      SELECT 
        DATE(entryDate) as date,
        COUNT(*) as value
      FROM trades
      WHERE userId = ?
    `;
    
    const params: any[] = [userId];
    
    if (startDate) {
      sql += " AND entryDate >= ?";
      params.push(startDate.toISOString());
    }
    
    if (endDate) {
      sql += " AND entryDate <= ?";
      params.push(endDate.toISOString());
    }
    
    sql += " GROUP BY DATE(entryDate) ORDER BY date ASC";
    
    return this.query(sql, params);
  }

  // Get profit/loss by instrument for charting
  async getProfitLossByInstrument(userId: number, startDate?: Date, endDate?: Date): Promise<ChartDataPoint[]> {
    let sql = `
      SELECT 
        instrument as label,
        SUM(profitLoss) as value
      FROM trades
      WHERE userId = ?
    `;
    
    const params: any[] = [userId];
    
    if (startDate) {
      sql += " AND entryDate >= ?";
      params.push(startDate.toISOString());
    }
    
    if (endDate) {
      sql += " AND entryDate <= ?";
      params.push(endDate.toISOString());
    }
    
    sql += " GROUP BY instrument ORDER BY value DESC";
    
    return this.query(sql, params);
  }

  // Get win/loss ratio by day
  async getWinLossRatioByDay(userId: number, startDate?: Date, endDate?: Date): Promise<ChartDataPoint[]> {
    let sql = `
      SELECT 
        DATE(entryDate) as date,
        SUM(CASE WHEN profitLoss > 0 THEN 1 ELSE 0 END) as wins,
        COUNT(*) as total
      FROM trades
      WHERE userId = ?
    `;
    
    const params: any[] = [userId];
    
    if (startDate) {
      sql += " AND entryDate >= ?";
      params.push(startDate.toISOString());
    }
    
    if (endDate) {
      sql += " AND entryDate <= ?";
      params.push(endDate.toISOString());
    }
    
    sql += " GROUP BY DATE(entryDate) ORDER BY date ASC";
    
    const results = await this.query(sql, params);
    
    // Calculate win rate percentage
    return results.map(row => ({
      date: row.date,
      value: row.total > 0 ? (row.wins / row.total) * 100 : 0
    }));
  }
}
