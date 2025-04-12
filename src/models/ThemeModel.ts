
import { BaseModel } from './BaseModel';

export interface Theme {
  id: number;
  name: string;
  type: 'light' | 'dark' | 'custom';
  isDefault: boolean;
  isSystem: boolean;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  additionalCss?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class ThemeModel extends BaseModel {
  constructor() {
    super('themes');
  }

  // Get all themes
  async getAllThemes(): Promise<Theme[]> {
    const sql = "SELECT * FROM themes";
    return this.query(sql, []);
  }

  // Get theme by ID
  async getThemeById(id: number): Promise<Theme | null> {
    return this.findById(id);
  }

  // Get theme by name
  async getThemeByName(name: string): Promise<Theme | null> {
    const sql = "SELECT * FROM themes WHERE name = ? LIMIT 1";
    const results = await this.query(sql, [name]);
    return results.length > 0 ? results[0] : null;
  }

  // Get default theme
  async getDefaultTheme(): Promise<Theme | null> {
    const sql = "SELECT * FROM themes WHERE isDefault = 1 LIMIT 1";
    const results = await this.query(sql, []);
    return results.length > 0 ? results[0] : null;
  }

  // Create a new theme
  async createTheme(theme: Omit<Theme, 'id' | 'createdAt' | 'updatedAt'>): Promise<number> {
    // Sanitize input
    const sanitizedTheme = this.sanitizeObject(theme);
    
    // Add timestamps
    const now = new Date();
    const themeWithTimestamps = {
      ...sanitizedTheme,
      createdAt: now,
      updatedAt: now
    };
    
    // If this theme is set as default, update all other themes to non-default
    if (theme.isDefault) {
      await this.clearDefaultThemes();
    }
    
    return this.create(themeWithTimestamps);
  }

  // Update a theme
  async updateTheme(id: number, themeData: Partial<Theme>): Promise<boolean> {
    // Sanitize input
    const sanitizedTheme = this.sanitizeObject(themeData);
    
    // Add updated timestamp
    const dataWithTimestamp = {
      ...sanitizedTheme,
      updatedAt: new Date()
    };
    
    // If this theme is set as default, update all other themes to non-default
    if (themeData.isDefault) {
      await this.clearDefaultThemes();
    }
    
    return this.update(id, dataWithTimestamp);
  }

  // Delete a theme
  async deleteTheme(id: number): Promise<boolean> {
    // Check if theme is default
    const theme = await this.getThemeById(id);
    if (theme?.isDefault) {
      throw new Error('Cannot delete the default theme');
    }
    
    if (theme?.isSystem) {
      throw new Error('Cannot delete a system theme');
    }
    
    return this.delete(id);
  }

  // Set a theme as the default theme
  async setDefaultTheme(id: number): Promise<boolean> {
    try {
      // First, clear all default flags
      await this.clearDefaultThemes();
      
      // Then set this theme as default
      return this.update(id, { isDefault: true });
    } catch (error) {
      console.error('Error setting default theme:', error);
      return false;
    }
  }

  // Clear default flag from all themes
  private async clearDefaultThemes(): Promise<void> {
    const sql = "UPDATE themes SET isDefault = 0";
    await this.query(sql, []);
  }

  // Get user theme preference
  async getUserThemePreference(userId: number): Promise<number | null> {
    const sql = "SELECT themeId FROM user_theme_preferences WHERE userId = ? LIMIT 1";
    const results = await this.query(sql, [userId]);
    return results.length > 0 ? results[0].themeId : null;
  }

  // Set user theme preference
  async setUserThemePreference(userId: number, themeId: number): Promise<boolean> {
    try {
      // Check if preference already exists
      const existingPref = await this.getUserThemePreference(userId);
      
      if (existingPref) {
        // Update existing preference
        const sql = "UPDATE user_theme_preferences SET themeId = ? WHERE userId = ?";
        await this.query(sql, [themeId, userId]);
      } else {
        // Create new preference
        const sql = "INSERT INTO user_theme_preferences (userId, themeId) VALUES (?, ?)";
        await this.query(sql, [userId, themeId]);
      }
      
      return true;
    } catch (error) {
      console.error('Error setting user theme preference:', error);
      return false;
    }
  }
}
