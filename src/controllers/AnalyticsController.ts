
import { AnalyticsModel, AnalyticsData, TradingStat } from '../models/AnalyticsModel';

export class AnalyticsController {
  private model: AnalyticsModel;

  constructor() {
    this.model = new AnalyticsModel();
  }

  // Get analytics data for a user
  async getUserAnalytics(userId: number, metricType?: string): Promise<AnalyticsData[]> {
    try {
      return await this.model.getUserAnalytics(userId, metricType);
    } catch (error) {
      console.error('Error getting user analytics:', error);
      return [];
    }
  }

  // Get specific metric data
  async getMetricData(userId: number, metricName: string, startDate?: Date, endDate?: Date): Promise<AnalyticsData[]> {
    try {
      return await this.model.getMetricData(userId, metricName, startDate, endDate);
    } catch (error) {
      console.error('Error getting metric data:', error);
      return [];
    }
  }

  // Record a new metric data point
  async recordMetric(data: Omit<AnalyticsData, 'id' | 'createdAt'>): Promise<number | null> {
    try {
      // Validate data
      this.validateMetricData(data);
      
      return await this.model.recordMetric(data);
    } catch (error) {
      console.error('Error recording metric:', error);
      return null;
    }
  }

  // Delete metric data
  async deleteMetricData(id: number, userId: number): Promise<boolean> {
    try {
      return await this.model.deleteMetricData(id, userId);
    } catch (error) {
      console.error('Error deleting metric data:', error);
      return false;
    }
  }

  // Calculate key trading statistics
  async calculateTradingStats(userId: number): Promise<TradingStat[]> {
    try {
      return await this.model.calculateTradingStats(userId);
    } catch (error) {
      console.error('Error calculating trading stats:', error);
      return [];
    }
  }

  // Get profit/loss time series data
  async getProfitLossTimeSeries(
    userId: number, 
    startDate: Date, 
    endDate: Date, 
    groupBy: 'day' | 'week' | 'month' = 'day'
  ): Promise<any[]> {
    try {
      // Validate dates
      this.validateDateRange(startDate, endDate);
      
      return await this.model.getProfitLossTimeSeries(userId, startDate, endDate, groupBy);
    } catch (error) {
      console.error('Error getting profit/loss time series:', error);
      return [];
    }
  }

  // Get tag performance data
  async getTagPerformance(userId: number): Promise<any[]> {
    try {
      return await this.model.getTagPerformance(userId);
    } catch (error) {
      console.error('Error getting tag performance:', error);
      return [];
    }
  }

  // Helper function to validate metric data
  private validateMetricData(data: Omit<AnalyticsData, 'id' | 'createdAt'>): void {
    if (!data.userId || typeof data.userId !== 'number') {
      throw new Error('Invalid or missing userId');
    }
    
    if (!data.metricType || typeof data.metricType !== 'string') {
      throw new Error('Invalid or missing metricType');
    }
    
    if (!data.metricName || typeof data.metricName !== 'string') {
      throw new Error('Invalid or missing metricName');
    }
    
    if (data.metricValue === undefined || typeof data.metricValue !== 'number') {
      throw new Error('Invalid or missing metricValue');
    }
    
    // Validate date if provided
    if (data.date && !(data.date instanceof Date) && isNaN(new Date(data.date).getTime())) {
      throw new Error('Invalid date format');
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
