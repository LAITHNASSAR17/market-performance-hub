
import { UserController } from './UserController';
import { TradeController } from './TradeController';
import { TagController } from './TagController';
import { ReportController } from './ReportController';
import { SettingsController } from './SettingsController';
import { CalendarController } from './CalendarController';
import { ChartController } from './ChartController';
import { ThemeController } from './ThemeController';
import { TranslationController } from './TranslationController';
import { AnalyticsController } from './AnalyticsController';

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  blockedUsers: number;
  totalTrades: number;
  recentTrades: number;
  totalProfitLoss: number;
  totalTags: number;
  popularTags: any[];
  systemHealth: {
    databaseStatus: 'online' | 'offline' | 'error';
    lastBackup: Date | null;
    errorCount: number;
  };
}

export class AdminController {
  private userController: UserController;
  private tradeController: TradeController;
  private tagController: TagController;
  private reportController: ReportController;
  private settingsController: SettingsController;
  private calendarController: CalendarController;
  private chartController: any; // Using any temporarily until ChartController is fully implemented
  private themeController: any; // Using any temporarily until ThemeController is fully implemented
  private translationController: any; // Using any temporarily until TranslationController is fully implemented
  private analyticsController: any; // Using any temporarily until AnalyticsController is fully implemented

  constructor() {
    this.userController = new UserController();
    this.tradeController = new TradeController();
    this.tagController = new TagController();
    this.reportController = new ReportController();
    this.settingsController = new SettingsController();
    this.calendarController = new CalendarController();
    this.chartController = new ChartController();
    this.themeController = new ThemeController();
    this.translationController = new TranslationController();
    this.analyticsController = new AnalyticsController();
  }

  // Admin Authentication
  async verifyAdminAccess(userId: number): Promise<boolean> {
    try {
      const user = await this.userController.getUser(userId);
      return user !== null && user.isAdmin === true;
    } catch (error) {
      console.error('Error verifying admin access:', error);
      return false;
    }
  }

  // Dashboard Statistics
  async getDashboardStats(): Promise<AdminStats> {
    try {
      const allUsers = await this.userController.getAllUsers();
      const totalUsers = allUsers.length;
      const activeUsers = allUsers.filter(user => !user.isBlocked).length;
      const blockedUsers = totalUsers - activeUsers;
      
      const allTrades = await this.tradeController.getAllTrades();
      const totalTrades = allTrades.length;
      
      // Get trades from last 7 days
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const recentTrades = allTrades.filter(trade => 
        new Date(trade.entryDate) >= oneWeekAgo
      ).length;
      
      // Calculate total P&L
      const totalProfitLoss = allTrades.reduce((sum, trade) => sum + trade.profitLoss, 0);
      
      // Get popular tags
      const popularTags = await this.tagController.getPopularTags(5);
      const totalTags = (await this.tagController.getAllTags()).length;
      
      // System health (mock data for now, would connect to real monitoring in production)
      const systemHealth = {
        databaseStatus: 'online' as const,
        lastBackup: new Date(),
        errorCount: 0
      };
      
      return {
        totalUsers,
        activeUsers,
        blockedUsers,
        totalTrades,
        recentTrades,
        totalProfitLoss,
        totalTags,
        popularTags,
        systemHealth
      };
    } catch (error) {
      console.error('Error getting admin dashboard stats:', error);
      // Return default stats if there's an error
      return {
        totalUsers: 0,
        activeUsers: 0,
        blockedUsers: 0,
        totalTrades: 0,
        recentTrades: 0,
        totalProfitLoss: 0,
        totalTags: 0,
        popularTags: [],
        systemHealth: {
          databaseStatus: 'error',
          lastBackup: null,
          errorCount: 1
        }
      };
    }
  }

  // User Management
  async getAllUsers() {
    return this.userController.getAllUsers();
  }
  
  async blockUser(userId: number) {
    return this.userController.blockUser(userId);
  }
  
  async unblockUser(userId: number) {
    return this.userController.unblockUser(userId);
  }
  
  async deleteUser(userId: number) {
    return this.userController.deleteUser(userId);
  }
  
  async resetUserPassword(userId: number, newPassword: string) {
    return this.userController.updateUser(userId, { password: newPassword });
  }

  // Trade Management
  async getAllTrades() {
    return this.tradeController.getAllTrades();
  }
  
  async getUserTrades(userId: number) {
    return this.tradeController.getUserTrades(userId);
  }
  
  async deleteTrade(tradeId: number) {
    return this.tradeController.deleteTrade(tradeId);
  }

  // Tag Management
  async getAllTags() {
    return this.tagController.getAllTags();
  }
  
  async createSystemTag(tagName: string, category: string = 'general') {
    // System tags have null userId
    return this.tagController.createTag({
      name: tagName,
      userId: null,
      type: category
    });
  }
  
  async deleteTag(tagId: number) {
    return this.tagController.deleteTag(tagId);
  }

  // Settings Management
  async getSystemSettings() {
    return this.settingsController.getSystemSettings();
  }
  
  async updateSystemSettings(key: string, value: string) {
    return this.settingsController.updateSystemSetting(key, value);
  }

  // Theme Management
  async getAllThemes() {
    return this.themeController.getAllThemes();
  }
  
  async setDefaultTheme(themeId: number) {
    return this.themeController.setDefaultTheme(themeId);
  }

  // Translation Management
  async getAllTranslations() {
    return this.translationController.getAllTranslations();
  }
  
  async updateTranslation(locale: string, key: string, value: string) {
    return this.translationController.updateTranslation(locale, key, value);
  }

  // Database Management
  async backupDatabase(): Promise<boolean> {
    try {
      // In a real app, this would trigger a backup process
      console.log('Database backup initiated');
      return true;
    } catch (error) {
      console.error('Error backing up database:', error);
      return false;
    }
  }
  
  async getDatabaseStatus(): Promise<{status: string, tables: number, size: string}> {
    // In a real app, this would check actual database status
    return {
      status: 'Connected',
      tables: 15,
      size: '24.5 MB'
    };
  }
  
  // System log management
  async getSystemLogs(limit: number = 100): Promise<any[]> {
    // In a real app, this would fetch actual logs
    return [
      { timestamp: new Date(), level: 'INFO', message: 'System started' },
      { timestamp: new Date(), level: 'WARNING', message: 'High CPU usage detected' }
    ];
  }
  
  // Create a full app backup (config, settings, etc.)
  async createSystemBackup(): Promise<{success: boolean, filename: string}> {
    // In a real app, this would create an actual backup
    return {
      success: true,
      filename: `backup_${new Date().toISOString().split('T')[0]}.zip`
    };
  }
}
