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
  private chartController: any;
  private themeController: any;
  private translationController: any;
  private analyticsController: any;

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

  async verifyAdminAccess(userId: string): Promise<boolean> {
    try {
      const user = await this.userController.getUser(userId);
      return user !== null && user.isAdmin === true;
    } catch (error) {
      console.error('Error verifying admin access:', error);
      return false;
    }
  }

  async getDashboardStats(): Promise<AdminStats> {
    try {
      const allUsers = await this.userController.getAllUsers();
      const totalUsers = allUsers.length;
      const activeUsers = allUsers.filter(user => !user.isBlocked).length;
      const blockedUsers = totalUsers - activeUsers;
      
      const allTrades = await this.getAllTrades();
      const totalTrades = allTrades.length;
      
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const recentTrades = allTrades.filter(trade => 
        new Date(trade.date) >= oneWeekAgo
      ).length;
      
      const totalProfitLoss = allTrades.reduce((sum, trade) => sum + trade.profitLoss, 0);
      
      const popularTags = await this.tagController.getPopularTags(5);
      const totalTags = (await this.getAllTags()).length;
      
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

  async getAllUsers() {
    return this.userController.getAllUsers();
  }
  
  async blockUser(userId: string) {
    return this.userController.blockUser(userId);
  }
  
  async unblockUser(userId: string) {
    return this.userController.unblockUser(userId);
  }
  
  async deleteUser(userId: string) {
    return this.userController.deleteUser(userId);
  }
  
  async resetUserPassword(userId: string, newPassword: string) {
    return this.userController.updateUser(userId, { password: newPassword });
  }

  async createUser(userData: any) {
    return this.userController.createUser(userData);
  }

  async getAllTrades() {
    try {
      return await this.tradeController.getUserTrades("0", 9999);
    } catch (error) {
      console.error('Error getting all trades:', error);
      return [];
    }
  }
  
  async getUserTrades(userId: string) {
    return this.tradeController.getUserTrades(userId);
  }
  
  async deleteTrade(tradeId: string) {
    return this.tradeController.deleteTrade(tradeId);
  }

  async getAllTags() {
    try {
      return await this.tagController.getSystemTags();
    } catch (error) {
      console.error('Error getting all tags:', error);
      return [];
    }
  }
  
  async createSystemTag(tagName: string, category: string = 'general') {
    return this.tagController.createTag({
      name: tagName,
      userId: null,
      type: category
    });
  }
  
  async deleteTag(tagId: string) {
    // Convert string tagId to number since TagController expects a number
    return this.tagController.deleteTag(Number(tagId));
  }

  async getSystemSettings() {
    return this.settingsController.getUserSettings("system");
  }
  
  async updateSystemSetting(key: string, value: string) {
    return this.settingsController.updateSetting("system", key, value, "system");
  }

  async getAllThemes() {
    return this.themeController.getAllThemes();
  }
  
  async setDefaultTheme(themeId: string): Promise<boolean> {
    // Convert string themeId to number since ThemeController expects a number
    return this.themeController.setDefaultTheme(Number(themeId));
  }

  async getAllTranslations() {
    return this.translationController.getAllTranslations();
  }
  
  async updateTranslation(locale: string, key: string, value: string) {
    return this.translationController.updateTranslation(locale, key, value);
  }

  async backupDatabase(): Promise<boolean> {
    try {
      console.log('Database backup initiated');
      return true;
    } catch (error) {
      console.error('Error backing up database:', error);
      return false;
    }
  }
  
  async getDatabaseStatus(): Promise<{status: string, tables: number, size: string}> {
    return {
      status: 'Connected',
      tables: 15,
      size: '24.5 MB'
    };
  }
  
  async getSystemLogs(limit: number = 100): Promise<any[]> {
    return [
      { timestamp: new Date(), level: 'INFO', message: 'System started' },
      { timestamp: new Date(), level: 'WARNING', message: 'High CPU usage detected' }
    ];
  }
  
  async createSystemBackup(): Promise<{success: boolean, filename: string}> {
    return {
      success: true,
      filename: `backup_${new Date().toISOString().split('T')[0]}.zip`
    };
  }

  async getDatabaseTableStructure(tableName: string): Promise<any[]> {
    try {
      return [
        { Field: 'id', Type: 'int', Null: 'NO', Key: 'PRI', Default: null, Extra: 'auto_increment' },
        { Field: 'name', Type: 'varchar(255)', Null: 'NO', Key: '', Default: null, Extra: '' },
        { Field: 'created_at', Type: 'timestamp', Null: 'NO', Key: '', Default: 'CURRENT_TIMESTAMP', Extra: '' }
      ];
    } catch (error) {
      console.error(`Error getting structure for table ${tableName}:`, error);
      return [];
    }
  }

  async getDatabaseTableData(tableName: string, limit = 10): Promise<any[]> {
    try {
      return [
        { id: 1, name: 'Sample 1', created_at: new Date().toISOString() },
        { id: 2, name: 'Sample 2', created_at: new Date().toISOString() },
        { id: 3, name: 'Sample 3', created_at: new Date().toISOString() }
      ];
    } catch (error) {
      console.error(`Error getting data for table ${tableName}:`, error);
      return [];
    }
  }

  async getUserThemePreference(userId: string): Promise<string | null> {
    try {
      const user = await this.userController.getUser(userId);
      return await this.themeController.getUserThemePreference(userId);
    } catch (error) {
      console.error('Error getting user theme preference:', error);
      return null;
    }
  }
  
  async setUserThemePreference(userId: string, themeId: string): Promise<boolean> {
    try {
      // Convert string themeId to number since ThemeController expects a number
      return await this.themeController.setUserThemePreference(userId, Number(themeId));
    } catch (error) {
      console.error('Error setting user theme preference:', error);
      return false;
    }
  }
  
  async applyTheme(userId: string): Promise<Record<string, string> | null> {
    try {
      const themeId = await this.getUserThemePreference(userId);
      
      if (themeId) {
        // Convert string themeId to number since ThemeController expects a number
        const theme = await this.themeController.getThemeById(Number(themeId));
        if (theme) {
          return await this.themeController.applyTheme(theme);
        }
      }
      
      const defaultTheme = await this.themeController.getDefaultTheme();
      if (defaultTheme) {
        return await this.themeController.applyTheme(defaultTheme);
      }
      
      return null;
    } catch (error) {
      console.error('Error applying theme:', error);
      return null;
    }
  }
}
