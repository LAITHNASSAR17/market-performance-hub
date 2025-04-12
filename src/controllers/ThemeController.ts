
import { ThemeModel, Theme } from '../models/ThemeModel';

export class ThemeController {
  private model: ThemeModel;

  constructor() {
    this.model = new ThemeModel();
  }

  // Get all themes
  async getAllThemes(): Promise<Theme[]> {
    try {
      return await this.model.getAllThemes();
    } catch (error) {
      console.error('Error getting all themes:', error);
      return [];
    }
  }

  // Get theme by ID
  async getThemeById(id: number): Promise<Theme | null> {
    try {
      return await this.model.getThemeById(id);
    } catch (error) {
      console.error('Error getting theme by ID:', error);
      return null;
    }
  }

  // Get theme by name
  async getThemeByName(name: string): Promise<Theme | null> {
    try {
      return await this.model.getThemeByName(name);
    } catch (error) {
      console.error('Error getting theme by name:', error);
      return null;
    }
  }

  // Get default theme
  async getDefaultTheme(): Promise<Theme | null> {
    try {
      return await this.model.getDefaultTheme();
    } catch (error) {
      console.error('Error getting default theme:', error);
      return null;
    }
  }

  // Create a new theme
  async createTheme(theme: Omit<Theme, 'id' | 'createdAt' | 'updatedAt'>): Promise<number | null> {
    try {
      // Validate theme data
      this.validateThemeData(theme);
      
      return await this.model.createTheme(theme);
    } catch (error) {
      console.error('Error creating theme:', error);
      return null;
    }
  }

  // Update a theme
  async updateTheme(id: number, themeData: Partial<Theme>): Promise<boolean> {
    try {
      // Validate theme data
      if (Object.keys(themeData).length > 0) {
        this.validateThemeData(themeData as any);
      }
      
      return await this.model.updateTheme(id, themeData);
    } catch (error) {
      console.error('Error updating theme:', error);
      return false;
    }
  }

  // Delete a theme
  async deleteTheme(id: number): Promise<boolean> {
    try {
      return await this.model.deleteTheme(id);
    } catch (error) {
      console.error('Error deleting theme:', error);
      return false;
    }
  }

  // Set a theme as the default theme
  async setDefaultTheme(id: number): Promise<boolean> {
    try {
      return await this.model.setDefaultTheme(id);
    } catch (error) {
      console.error('Error setting default theme:', error);
      return false;
    }
  }

  // Get user theme preference
  async getUserThemePreference(userId: number): Promise<Theme | null> {
    try {
      const themeId = await this.model.getUserThemePreference(userId);
      
      if (themeId) {
        return this.model.getThemeById(themeId);
      }
      
      // If no preference, return default theme
      return this.model.getDefaultTheme();
    } catch (error) {
      console.error('Error getting user theme preference:', error);
      return null;
    }
  }

  // Set user theme preference
  async setUserThemePreference(userId: number, themeId: number): Promise<boolean> {
    try {
      // Validate that the theme exists
      const theme = await this.model.getThemeById(themeId);
      if (!theme) {
        throw new Error('Theme does not exist');
      }
      
      return await this.model.setUserThemePreference(userId, themeId);
    } catch (error) {
      console.error('Error setting user theme preference:', error);
      return false;
    }
  }

  // Apply theme to user session
  async applyTheme(theme: Theme): Promise<Record<string, string>> {
    // Generate CSS variables
    return {
      '--primary-color': theme.primaryColor,
      '--secondary-color': theme.secondaryColor,
      '--background-color': theme.backgroundColor,
      '--text-color': theme.textColor,
      '--accent-color': theme.accentColor
    };
  }

  // Helper function to validate theme data
  private validateThemeData(theme: Omit<Theme, 'id' | 'createdAt' | 'updatedAt'>): void {
    if (!theme.name || typeof theme.name !== 'string') {
      throw new Error('Invalid or missing theme name');
    }
    
    if (theme.type && !['light', 'dark', 'custom'].includes(theme.type)) {
      throw new Error('Invalid theme type. Must be "light", "dark", or "custom"');
    }
    
    // Color validation helper
    const isValidColor = (color: string) => {
      // Check for hex format
      const hexRegex = /^#([A-Fa-f0-9]{3}){1,2}$/;
      // Check for rgb/rgba format
      const rgbRegex = /^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(?:,\s*(?:0|1|0?\.\d+))?\s*\)$/;
      // Check for named colors
      const namedColors = [
        'white', 'black', 'red', 'green', 'blue', 'yellow', 'purple', 'orange',
        'gray', 'grey', 'pink', 'brown', 'cyan', 'magenta', 'transparent'
      ];
      
      return hexRegex.test(color) || rgbRegex.test(color) || namedColors.includes(color.toLowerCase());
    };
    
    // Validate color fields
    if (theme.primaryColor && (!isValidColor(theme.primaryColor))) {
      throw new Error('Invalid primary color format');
    }
    
    if (theme.secondaryColor && (!isValidColor(theme.secondaryColor))) {
      throw new Error('Invalid secondary color format');
    }
    
    if (theme.backgroundColor && (!isValidColor(theme.backgroundColor))) {
      throw new Error('Invalid background color format');
    }
    
    if (theme.textColor && (!isValidColor(theme.textColor))) {
      throw new Error('Invalid text color format');
    }
    
    if (theme.accentColor && (!isValidColor(theme.accentColor))) {
      throw new Error('Invalid accent color format');
    }
  }
}
