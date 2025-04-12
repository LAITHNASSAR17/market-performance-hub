
import { SettingsModel, UserSettings } from '../models/SettingsModel';

export class SettingsController {
  private model: SettingsModel;

  constructor() {
    this.model = new SettingsModel();
  }

  // Get all user settings as a structured object
  async getUserSettings(userId: number): Promise<UserSettings> {
    try {
      return await this.model.getUserSettingsObject(userId);
    } catch (error) {
      console.error('Error getting user settings:', error);
      
      // Return default settings if there's an error
      return {
        theme: 'light',
        language: 'en',
        timezone: 'UTC',
        currency: 'USD',
        notifications: {
          email: true,
          app: true,
          desktop: false
        },
        displayPreferences: {
          showTradingHours: true,
          defaultChartTimeframe: 'D1',
          defaultView: 'trades'
        }
      };
    }
  }

  // Save all user settings
  async saveUserSettings(userId: number, settings: UserSettings): Promise<boolean> {
    try {
      // Validate settings
      this.validateSettings(settings);
      
      return await this.model.saveUserSettingsObject(userId, settings);
    } catch (error) {
      console.error('Error saving user settings:', error);
      return false;
    }
  }

  // Get a specific setting
  async getSetting(userId: number, category: string, key: string): Promise<string | null> {
    try {
      const setting = await this.model.getSetting(userId, category, key);
      return setting ? setting.settingValue : null;
    } catch (error) {
      console.error('Error getting setting:', error);
      return null;
    }
  }

  // Update a specific setting
  async updateSetting(userId: number, category: string, key: string, value: string): Promise<boolean> {
    try {
      return await this.model.setSetting(userId, category, key, value);
    } catch (error) {
      console.error('Error updating setting:', error);
      return false;
    }
  }

  // Delete a specific setting
  async deleteSetting(userId: number, category: string, key: string): Promise<boolean> {
    try {
      return await this.model.deleteSetting(userId, category, key);
    } catch (error) {
      console.error('Error deleting setting:', error);
      return false;
    }
  }

  // Update theme setting
  async updateTheme(userId: number, theme: 'light' | 'dark'): Promise<boolean> {
    try {
      if (theme !== 'light' && theme !== 'dark') {
        throw new Error('Invalid theme value. Must be "light" or "dark"');
      }
      
      return await this.model.setSetting(userId, 'general', 'theme', theme);
    } catch (error) {
      console.error('Error updating theme:', error);
      return false;
    }
  }

  // Update language setting
  async updateLanguage(userId: number, language: string): Promise<boolean> {
    try {
      // Basic validation
      if (!language || typeof language !== 'string' || language.length > 10) {
        throw new Error('Invalid language value');
      }
      
      return await this.model.setSetting(userId, 'general', 'language', language);
    } catch (error) {
      console.error('Error updating language:', error);
      return false;
    }
  }

  // Helper function to validate settings object
  private validateSettings(settings: UserSettings): void {
    // Theme validation
    if (settings.theme && !['light', 'dark'].includes(settings.theme)) {
      throw new Error('Invalid theme value. Must be "light" or "dark"');
    }
    
    // Language validation
    if (settings.language && typeof settings.language !== 'string') {
      throw new Error('Language must be a string');
    }
    
    // Timezone validation
    if (settings.timezone && typeof settings.timezone !== 'string') {
      throw new Error('Timezone must be a string');
    }
    
    // Currency validation
    if (settings.currency && typeof settings.currency !== 'string') {
      throw new Error('Currency must be a string');
    }
    
    // Notifications validation
    if (settings.notifications) {
      if (typeof settings.notifications !== 'object') {
        throw new Error('Notifications must be an object');
      }
      
      if ('email' in settings.notifications && typeof settings.notifications.email !== 'boolean') {
        throw new Error('Notification email setting must be a boolean');
      }
      
      if ('app' in settings.notifications && typeof settings.notifications.app !== 'boolean') {
        throw new Error('Notification app setting must be a boolean');
      }
      
      if ('desktop' in settings.notifications && typeof settings.notifications.desktop !== 'boolean') {
        throw new Error('Notification desktop setting must be a boolean');
      }
    }
    
    // Display preferences validation
    if (settings.displayPreferences) {
      if (typeof settings.displayPreferences !== 'object') {
        throw new Error('Display preferences must be an object');
      }
      
      if ('showTradingHours' in settings.displayPreferences && 
          typeof settings.displayPreferences.showTradingHours !== 'boolean') {
        throw new Error('Show trading hours setting must be a boolean');
      }
      
      if ('defaultChartTimeframe' in settings.displayPreferences && 
          typeof settings.displayPreferences.defaultChartTimeframe !== 'string') {
        throw new Error('Default chart timeframe must be a string');
      }
      
      if ('defaultView' in settings.displayPreferences && 
          typeof settings.displayPreferences.defaultView !== 'string') {
        throw new Error('Default view must be a string');
      }
    }
  }
}
