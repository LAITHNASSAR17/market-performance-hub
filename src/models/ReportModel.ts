
import { BaseModel } from './BaseModel';

export interface Report {
  id: number;
  userId: number;
  title: string;
  description: string;
  type: string;
  startDate: Date;
  endDate: Date;
  parameters: string; // JSON string containing report parameters
  createdAt: Date;
  updatedAt: Date;
}

export interface ReportSummary {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  averageWin: number;
  averageLoss: number;
  profitFactor: number;
  netProfit: number;
  largestWin: number;
  largestLoss: number;
  averageHoldingTime: number;
}

export class ReportModel extends BaseModel {
  constructor() {
    super('reports');
  }

  // Get all reports for a user
  async getUserReports(userId: number): Promise<Report[]> {
    const sql = "SELECT * FROM reports WHERE userId = ? ORDER BY createdAt DESC";
    return this.query(sql, [userId]);
  }

  // Get a report by ID
  async getReportById(id: number, userId: number): Promise<Report | null> {
    const sql = "SELECT * FROM reports WHERE id = ? AND userId = ?";
    const results = await this.query(sql, [id, userId]);
    return results.length > 0 ? results[0] : null;
  }

  // Create a new report
  async createReport(report: Omit<Report, 'id' | 'createdAt' | 'updatedAt'>): Promise<number> {
    // Sanitize input
    const sanitizedReport = this.sanitizeObject(report);
    
    // Add timestamps
    const now = new Date();
    const reportWithTimestamps = {
      ...sanitizedReport,
      createdAt: now,
      updatedAt: now
    };
    
    return this.create(reportWithTimestamps);
  }

  // Update a report
  async updateReport(id: number, userId: number, reportData: Partial<Report>): Promise<boolean> {
    // Sanitize input
    const sanitizedData = this.sanitizeObject(reportData);
    
    // Add updated timestamp
    const dataWithTimestamp = {
      ...sanitizedData,
      updatedAt: new Date()
    };
    
    const sql = "UPDATE reports SET ? WHERE id = ? AND userId = ?";
    const result = await this.query(sql, [dataWithTimestamp, id, userId]);
    return result.affectedRows > 0;
  }

  // Delete a report
  async deleteReport(id: number, userId: number): Promise<boolean> {
    const sql = "DELETE FROM reports WHERE id = ? AND userId = ?";
    const result = await this.query(sql, [id, userId]);
    return result.affectedRows > 0;
  }

  // Generate a performance summary report
  async generatePerformanceSummary(userId: number, startDate: Date, endDate: Date): Promise<ReportSummary> {
    const sql = `
      SELECT 
        COUNT(*) as totalTrades,
        SUM(CASE WHEN profitLoss > 0 THEN 1 ELSE 0 END) as winningTrades,
        SUM(CASE WHEN profitLoss <= 0 THEN 1 ELSE 0 END) as losingTrades,
        AVG(CASE WHEN profitLoss > 0 THEN profitLoss ELSE NULL END) as averageWin,
        AVG(CASE WHEN profitLoss <= 0 THEN profitLoss ELSE NULL END) as averageLoss,
        SUM(profitLoss) as netProfit,
        MAX(CASE WHEN profitLoss > 0 THEN profitLoss ELSE 0 END) as largestWin,
        MIN(CASE WHEN profitLoss <= 0 THEN profitLoss ELSE 0 END) as largestLoss,
        AVG(TIMESTAMPDIFF(MINUTE, entryDate, exitDate)) / (60 * 24) as averageHoldingTime
      FROM trades
      WHERE userId = ? AND entryDate >= ? AND exitDate <= ? AND exitDate IS NOT NULL
    `;
    
    const results = await this.query(sql, [userId, startDate, endDate]);
    const data = results[0];
    
    // Calculate win rate and profit factor
    const winRate = data.totalTrades > 0 ? (data.winningTrades / data.totalTrades) * 100 : 0;
    
    // Calculate profit factor (sum of winning trades / sum of losing trades)
    let profitFactor = 0;
    if (data.totalTrades > 0) {
      const winningSum = await this.calculateWinningSum(userId, startDate, endDate);
      const losingSum = await this.calculateLosingSum(userId, startDate, endDate);
      profitFactor = Math.abs(losingSum) > 0 ? Math.abs(winningSum / losingSum) : winningSum > 0 ? Infinity : 0;
    }
    
    return {
      totalTrades: data.totalTrades || 0,
      winningTrades: data.winningTrades || 0,
      losingTrades: data.losingTrades || 0,
      winRate: parseFloat(winRate.toFixed(2)),
      averageWin: data.averageWin || 0,
      averageLoss: data.averageLoss || 0,
      profitFactor: parseFloat(profitFactor.toFixed(2)),
      netProfit: data.netProfit || 0,
      largestWin: data.largestWin || 0,
      largestLoss: data.largestLoss || 0,
      averageHoldingTime: parseFloat(data.averageHoldingTime.toFixed(2)) || 0
    };
  }

  // Helper method to calculate sum of winning trades
  private async calculateWinningSum(userId: number, startDate: Date, endDate: Date): Promise<number> {
    const sql = `
      SELECT SUM(profitLoss) as winningSum
      FROM trades
      WHERE userId = ? AND entryDate >= ? AND exitDate <= ? AND profitLoss > 0
    `;
    const results = await this.query(sql, [userId, startDate, endDate]);
    return results[0].winningSum || 0;
  }

  // Helper method to calculate sum of losing trades
  private async calculateLosingSum(userId: number, startDate: Date, endDate: Date): Promise<number> {
    const sql = `
      SELECT SUM(profitLoss) as losingSum
      FROM trades
      WHERE userId = ? AND entryDate >= ? AND exitDate <= ? AND profitLoss <= 0
    `;
    const results = await this.query(sql, [userId, startDate, endDate]);
    return results[0].losingSum || 0;
  }

  // Generate report by instrument
  async generateInstrumentReport(userId: number, startDate: Date, endDate: Date): Promise<any[]> {
    const sql = `
      SELECT 
        instrument,
        COUNT(*) as totalTrades,
        SUM(CASE WHEN profitLoss > 0 THEN 1 ELSE 0 END) as winningTrades,
        SUM(CASE WHEN profitLoss <= 0 THEN 1 ELSE 0 END) as losingTrades,
        SUM(profitLoss) as netProfit,
        AVG(profitLoss) as averageProfitLoss
      FROM trades
      WHERE userId = ? AND entryDate >= ? AND exitDate <= ? AND exitDate IS NOT NULL
      GROUP BY instrument
      ORDER BY netProfit DESC
    `;
    
    return this.query(sql, [userId, startDate, endDate]);
  }

  // Generate report by time of day
  async generateTimeOfDayReport(userId: number, startDate: Date, endDate: Date): Promise<any[]> {
    const sql = `
      SELECT 
        HOUR(entryDate) as hourOfDay,
        COUNT(*) as totalTrades,
        SUM(CASE WHEN profitLoss > 0 THEN 1 ELSE 0 END) as winningTrades,
        SUM(CASE WHEN profitLoss <= 0 THEN 1 ELSE 0 END) as losingTrades,
        SUM(profitLoss) as netProfit
      FROM trades
      WHERE userId = ? AND entryDate >= ? AND exitDate <= ? AND exitDate IS NOT NULL
      GROUP BY HOUR(entryDate)
      ORDER BY HOUR(entryDate)
    `;
    
    return this.query(sql, [userId, startDate, endDate]);
  }
}
