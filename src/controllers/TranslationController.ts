
import { TranslationModel, Translation } from '../models/TranslationModel';

export class TranslationController {
  private model: TranslationModel;

  constructor() {
    this.model = new TranslationModel();
  }

  // Get all translations
  async getAllTranslations(): Promise<Translation[]> {
    try {
      return await this.model.getAllTranslations();
    } catch (error) {
      console.error('Error getting all translations:', error);
      return [];
    }
  }

  // Get translations by language
  async getTranslationsByLanguage(language: string): Promise<Translation[]> {
    try {
      return await this.model.getTranslationsByLanguage(language);
    } catch (error) {
      console.error('Error getting translations by language:', error);
      return [];
    }
  }

  // Get translations by language and namespace
  async getTranslationsByNamespace(language: string, namespace: string): Promise<Translation[]> {
    try {
      return await this.model.getTranslationsByNamespace(language, namespace);
    } catch (error) {
      console.error('Error getting translations by namespace:', error);
      return [];
    }
  }

  // Get a specific translation
  async getTranslation(language: string, namespace: string, key: string): Promise<Translation | null> {
    try {
      return await this.model.getTranslation(language, namespace, key);
    } catch (error) {
      console.error('Error getting translation:', error);
      return null;
    }
  }

  // Create or update a translation
  async setTranslation(translation: Omit<Translation, 'id' | 'createdAt' | 'updatedAt'>): Promise<number | null> {
    try {
      // Validate translation data
      this.validateTranslationData(translation);
      
      return await this.model.setTranslation(translation);
    } catch (error) {
      console.error('Error setting translation:', error);
      return null;
    }
  }

  // Delete a translation
  async deleteTranslation(id: number): Promise<boolean> {
    try {
      return await this.model.deleteTranslation(id);
    } catch (error) {
      console.error('Error deleting translation:', error);
      return false;
    }
  }

  // Get all supported languages
  async getSupportedLanguages(): Promise<string[]> {
    try {
      return await this.model.getSupportedLanguages();
    } catch (error) {
      console.error('Error getting supported languages:', error);
      return [];
    }
  }

  // Get translations as a JSON object for a specific language
  async getTranslationsAsObject(language: string): Promise<Record<string, Record<string, string>>> {
    try {
      return await this.model.getTranslationsAsObject(language);
    } catch (error) {
      console.error('Error getting translations as object:', error);
      return {};
    }
  }

  // Import translations from a JSON object
  async importTranslations(language: string, data: Record<string, Record<string, string>>): Promise<boolean> {
    try {
      // Validate language
      if (!language || typeof language !== 'string' || language.length > 10) {
        throw new Error('Invalid language code');
      }
      
      // Validate data
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid translation data');
      }
      
      return await this.model.importTranslations(language, data);
    } catch (error) {
      console.error('Error importing translations:', error);
      return false;
    }
  }

  // Helper function to validate translation data
  private validateTranslationData(translation: Omit<Translation, 'id' | 'createdAt' | 'updatedAt'>): void {
    if (!translation.language || typeof translation.language !== 'string') {
      throw new Error('Invalid or missing language');
    }
    
    if (!translation.namespace || typeof translation.namespace !== 'string') {
      throw new Error('Invalid or missing namespace');
    }
    
    if (!translation.key || typeof translation.key !== 'string') {
      throw new Error('Invalid or missing key');
    }
    
    if (translation.value === undefined || typeof translation.value !== 'string') {
      throw new Error('Invalid or missing value');
    }
  }
}
