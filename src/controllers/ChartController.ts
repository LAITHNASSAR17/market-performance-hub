
import { ChartModel, ChartData, ChartDataPoint } from '../models/ChartModel';

export class ChartController {
  private model: ChartModel;

  constructor() {
    this.model = new ChartModel();
  }

  // Get all chart settings for a user
  async getUserCharts(userId: number): Promise<ChartData[]> {
    try {
      return await this.model.getUserCharts(userId);
    } catch (error) {
      console.error('Error getting user charts:', error);
      return [];
    }
  }

  // Get chart by ID
  async getChartById(id: number, userId: number): Promise<ChartData | null> {
    try {
      return await this.model.getChartById(id, userId);
    } catch (error) {
      console.error('Error getting chart by ID:', error);
      return null;
    }
  }

  // Save chart settings
  async saveChartSettings(chartData: Omit<ChartData, 'id' | 'createdAt' | 'updatedAt'>): Promise<number | null> {
    try {
      // Validate chart data
      this.validateChartData(chartData);
      
      return await this.model.saveChartSettings(chartData);
    } catch (error) {
      console.error('Error saving chart settings:', error);
      return null;
    }
  }

  // Delete chart settings
  async deleteChartSettings(id: number, userId: number): Promise<boolean> {
    try {
      return await this.model.deleteChartSettings(id, userId);
    } catch (error) {
      console.error('Error deleting chart settings:', error);
      return false;
    }
  }

  // Get P&L data by day for charting
  async getProfitLossByDay(userId: number, startDate?: Date, endDate?: Date): Promise<ChartDataPoint[]> {
    try {
      if (startDate && endDate) {
        this.validateDateRange(startDate, endDate);
      }
      
      return await this.model.getProfitLossByDay(userId, startDate, endDate);
    } catch (error) {
      console.error('Error getting profit/loss by day:', error);
      return [];
    }
  }

  // Get cumulative P&L data for charting
  async getCumulativeProfitLoss(userId: number, startDate?: Date, endDate?: Date): Promise<ChartDataPoint[]> {
    try {
      if (startDate && endDate) {
        this.validateDateRange(startDate, endDate);
      }
      
      return await this.model.getCumulativeProfitLoss(userId, startDate, endDate);
    } catch (error) {
      console.error('Error getting cumulative profit/loss:', error);
      return [];
    }
  }

  // Get trade count by day for charting
  async getTradeCountByDay(userId: number, startDate?: Date, endDate?: Date): Promise<ChartDataPoint[]> {
    try {
      if (startDate && endDate) {
        this.validateDateRange(startDate, endDate);
      }
      
      return await this.model.getTradeCountByDay(userId, startDate, endDate);
    } catch (error) {
      console.error('Error getting trade count by day:', error);
      return [];
    }
  }

  // Get profit/loss by instrument for charting
  async getProfitLossByInstrument(userId: number, startDate?: Date, endDate?: Date): Promise<ChartDataPoint[]> {
    try {
      if (startDate && endDate) {
        this.validateDateRange(startDate, endDate);
      }
      
      return await this.model.getProfitLossByInstrument(userId, startDate, endDate);
    } catch (error) {
      console.error('Error getting profit/loss by instrument:', error);
      return [];
    }
  }

  // Get win/loss ratio by day
  async getWinLossRatioByDay(userId: number, startDate?: Date, endDate?: Date): Promise<ChartDataPoint[]> {
    try {
      if (startDate && endDate) {
        this.validateDateRange(startDate, endDate);
      }
      
      return await this.model.getWinLossRatioByDay(userId, startDate, endDate);
    } catch (error) {
      console.error('Error getting win/loss ratio by day:', error);
      return [];
    }
  }

  // Helper function to validate chart data
  private validateChartData(chartData: Omit<ChartData, 'id' | 'createdAt' | 'updatedAt'>): void {
    if (!chartData.userId || typeof chartData.userId !== 'number') {
      throw new Error('Invalid or missing userId');
    }
    
    if (!chartData.chartType || typeof chartData.chartType !== 'string') {
      throw new Error('Invalid or missing chartType');
    }
    
    if (!chartData.chartName || typeof chartData.chartName !== 'string') {
      throw new Error('Invalid or missing chartName');
    }
    
    // Validate settings is a valid JSON string if provided
    if (chartData.settings) {
      try {
        JSON.parse(chartData.settings);
      } catch (e) {
        throw new Error('Settings must be a valid JSON string');
      }
    }
  }

  // Helper function to validate date range
  private validateDateRange(startDate: Date, endDate: Date): void {
    if (!(startDate instanceof Date) || isNaN(startDate.getTime())) {
      throw new Error('Invalid start date');
    }
    
    if (!(endDate instanceof Date) || isNaN(endDate.getTime())) {
      throw new Error('Invalid end date');
    }
    
    if (startDate > endDate) {
      throw new Error('Start date must be before end date');
    }
  }
}
