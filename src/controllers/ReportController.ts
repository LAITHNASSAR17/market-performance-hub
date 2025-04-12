
import { ReportModel, Report, ReportSummary } from '../models/ReportModel';

export class ReportController {
  private model: ReportModel;

  constructor() {
    this.model = new ReportModel();
  }

  // Get all reports for a user
  async getUserReports(userId: number): Promise<Report[]> {
    try {
      return await this.model.getUserReports(userId);
    } catch (error) {
      console.error('Error getting user reports:', error);
      return [];
    }
  }

  // Get a report by ID
  async getReportById(id: number, userId: number): Promise<Report | null> {
    try {
      return await this.model.getReportById(id, userId);
    } catch (error) {
      console.error('Error getting report by ID:', error);
      return null;
    }
  }

  // Create a new report
  async createReport(report: Omit<Report, 'id' | 'createdAt' | 'updatedAt'>): Promise<number | null> {
    try {
      // Validate report data
      this.validateReportData(report);
      
      return await this.model.createReport(report);
    } catch (error) {
      console.error('Error creating report:', error);
      return null;
    }
  }

  // Update a report
  async updateReport(id: number, userId: number, reportData: Partial<Report>): Promise<boolean> {
    try {
      // Check if the report exists and belongs to the user
      const existingReport = await this.model.getReportById(id, userId);
      if (!existingReport) {
        throw new Error('Report not found or does not belong to this user');
      }
      
      // Validate report data
      if (Object.keys(reportData).length > 0) {
        this.validateReportData(reportData as any);
      }
      
      return await this.model.updateReport(id, userId, reportData);
    } catch (error) {
      console.error('Error updating report:', error);
      return false;
    }
  }

  // Delete a report
  async deleteReport(id: number, userId: number): Promise<boolean> {
    try {
      // Check if the report exists and belongs to the user
      const existingReport = await this.model.getReportById(id, userId);
      if (!existingReport) {
        throw new Error('Report not found or does not belong to this user');
      }
      
      return await this.model.deleteReport(id, userId);
    } catch (error) {
      console.error('Error deleting report:', error);
      return false;
    }
  }

  // Generate performance summary report
  async generatePerformanceSummary(userId: number, startDate: Date, endDate: Date): Promise<ReportSummary> {
    try {
      // Validate dates
      this.validateDateRange(startDate, endDate);
      
      return await this.model.generatePerformanceSummary(userId, startDate, endDate);
    } catch (error) {
      console.error('Error generating performance summary:', error);
      return {
        totalTrades: 0,
        winningTrades: 0,
        losingTrades: 0,
        winRate: 0,
        averageWin: 0,
        averageLoss: 0,
        profitFactor: 0,
        netProfit: 0,
        largestWin: 0,
        largestLoss: 0,
        averageHoldingTime: 0
      };
    }
  }

  // Generate instrument report
  async generateInstrumentReport(userId: number, startDate: Date, endDate: Date): Promise<any[]> {
    try {
      // Validate dates
      this.validateDateRange(startDate, endDate);
      
      return await this.model.generateInstrumentReport(userId, startDate, endDate);
    } catch (error) {
      console.error('Error generating instrument report:', error);
      return [];
    }
  }

  // Generate time of day report
  async generateTimeOfDayReport(userId: number, startDate: Date, endDate: Date): Promise<any[]> {
    try {
      // Validate dates
      this.validateDateRange(startDate, endDate);
      
      return await this.model.generateTimeOfDayReport(userId, startDate, endDate);
    } catch (error) {
      console.error('Error generating time of day report:', error);
      return [];
    }
  }

  // Helper function to validate report data
  private validateReportData(report: Omit<Report, 'id' | 'createdAt' | 'updatedAt'>): void {
    if (!report.userId || typeof report.userId !== 'number') {
      throw new Error('Invalid or missing userId');
    }
    
    if (!report.title || typeof report.title !== 'string') {
      throw new Error('Invalid or missing title');
    }
    
    if (!report.type || typeof report.type !== 'string') {
      throw new Error('Invalid or missing report type');
    }
    
    // Validate dates if provided
    if (report.startDate && report.endDate) {
      this.validateDateRange(new Date(report.startDate), new Date(report.endDate));
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
