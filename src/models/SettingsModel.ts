import { BaseModel } from './BaseModel';

export interface Settings {
  id: number;
  userId: number;
  category: string;
  settingKey: string;
  settingValue: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserSettings {
  theme: string;
  language: string;
  timezone: string;
  currency: string;
  notifications: {
    email: boolean;
    app: boolean;
    desktop: boolean;
  };
  displayPreferences: {
    showTradingHours: boolean;
    defaultChartTimeframe: string;
    defaultView: string;
  };
  [key: string]: any;
}

export class SettingsModel extends BaseModel {
  constructor() {
    super('settings');
  }

  // Get all settings for a user
  async getUserSettings(userId: number): Promise<Settings[]> {
    const sql = "SELECT * FROM settings WHERE userId = ?";
    return this.query(sql, [userId]);
  }

  // Get settings by category
  async getSettingsByCategory(userId: number, category: string): Promise<Settings[]> {
    const sql = "SELECT * FROM settings WHERE userId = ? AND category = ?";
    return this.query(sql, [userId, category]);
  }

  // Get a specific setting
  async getSetting(userId: number, category: string, settingKey: string): Promise<Settings | null> {
    const sql = "SELECT * FROM settings WHERE userId = ? AND category = ? AND settingKey = ? LIMIT 1";
    const results = await this.query(sql, [userId, category, settingKey]);
    return results.length > 0 ? results[0] : null;
  }

  // Create or update a setting
  async setSetting(userId: number, category: string, settingKey: string, settingValue: string): Promise<boolean> {
    try {
      // Check if setting already exists
      const existingSetting = await this.getSetting(userId, category, settingKey);
      
      const now = new Date();
      
      if (existingSetting) {
        // Update existing setting
        const sql = "UPDATE settings SET settingValue = ?, updatedAt = ? WHERE id = ?";
        await this.query(sql, [settingValue, now, existingSetting.id]);
      } else {
        // Create new setting
        const sql = "INSERT INTO settings (userId, category, settingKey, settingValue, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)";
        await this.query(sql, [userId, category, settingKey, settingValue, now, now]);
      }
      
      return true;
    } catch (error) {
      console.error("Error setting setting:", error);
      return false;
    }
  }

  // Delete a setting
  async deleteSetting(userId: number, category: string, settingKey: string): Promise<boolean> {
    const sql = "DELETE FROM settings WHERE userId = ? AND category = ? AND settingKey = ?";
    const result = await this.query(sql, [userId, category, settingKey]);
    return result.length > 0 && result[0].affectedRows > 0;
  }

  // Get all user settings as a structured object
  async getUserSettingsObject(userId: number): Promise<UserSettings> {
    // Get all settings for the user
    const settings = await this.getUserSettings(userId);
    
    // Default settings
    const defaultSettings: UserSettings = {
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
    
    // Convert array of settings to object
    if (settings.length === 0) {
      return defaultSettings;
    }
    
    const settingsObject: any = {};
    
    for (const setting of settings) {
      if (!settingsObject[setting.category]) {
        settingsObject[setting.category] = {};
      }
      
      try {
        // Try to parse as JSON
        settingsObject[setting.category][setting.settingKey] = JSON.parse(setting.settingValue);
      } catch (e) {
        // If not JSON, use the raw value
        settingsObject[setting.category][setting.settingKey] = setting.settingValue;
      }
    }
    
    // Merge with default settings
    return { ...defaultSettings, ...settingsObject };
  }

  // Save all settings from a structured object
  async saveUserSettingsObject(userId: number, settingsObject: UserSettings): Promise<boolean> {
    try {
      // Flatten the settings object
      const flatSettings: { category: string, key: string, value: string }[] = [];
      
      for (const [category, categorySettings] of Object.entries(settingsObject)) {
        if (typeof categorySettings === 'object' && categorySettings !== null) {
          for (const [key, value] of Object.entries(categorySettings)) {
            flatSettings.push({
              category,
              key,
              value: typeof value === 'object' ? JSON.stringify(value) : String(value)
            });
          }
        } else {
          flatSettings.push({
            category: 'general',
            key: category,
            value: typeof categorySettings === 'object' ? JSON.stringify(categorySettings) : String(categorySettings)
          });
        }
      }
      
      // Save each setting
      for (const setting of flatSettings) {
        await this.setSetting(userId, setting.category, setting.key, setting.value);
      }
      
      return true;
    } catch (error) {
      console.error("Error saving settings object:", error);
      return false;
    }
  }
}
