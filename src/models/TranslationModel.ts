
import { BaseModel } from './BaseModel';

export interface Translation {
  id: number;
  language: string;
  namespace: string;
  key: string;
  value: string;
  createdAt: Date;
  updatedAt: Date;
}

export class TranslationModel extends BaseModel {
  constructor() {
    super('translations');
  }

  // Get all translations
  async getAllTranslations(): Promise<Translation[]> {
    const sql = "SELECT * FROM translations";
    return this.query(sql, []);
  }

  // Get translations by language
  async getTranslationsByLanguage(language: string): Promise<Translation[]> {
    const sql = "SELECT * FROM translations WHERE language = ?";
    return this.query(sql, [language]);
  }

  // Get translations by language and namespace
  async getTranslationsByNamespace(language: string, namespace: string): Promise<Translation[]> {
    const sql = "SELECT * FROM translations WHERE language = ? AND namespace = ?";
    return this.query(sql, [language, namespace]);
  }

  // Get a specific translation
  async getTranslation(language: string, namespace: string, key: string): Promise<Translation | null> {
    const sql = "SELECT * FROM translations WHERE language = ? AND namespace = ? AND key = ? LIMIT 1";
    const results = await this.query(sql, [language, namespace, key]);
    return results.length > 0 ? results[0] : null;
  }

  // Create or update a translation
  async setTranslation(translation: Omit<Translation, 'id' | 'createdAt' | 'updatedAt'>): Promise<number> {
    // Sanitize input
    const sanitizedTranslation = this.sanitizeObject(translation);
    
    // Check if translation already exists
    const existingTranslation = await this.getTranslation(
      translation.language,
      translation.namespace,
      translation.key
    );
    
    const now = new Date();
    
    if (existingTranslation) {
      // Update existing translation
      await this.update(existingTranslation.id, {
        value: translation.value,
        updatedAt: now
      });
      
      return existingTranslation.id;
    } else {
      // Create new translation
      const translationWithTimestamps = {
        ...sanitizedTranslation,
        createdAt: now,
        updatedAt: now
      };
      
      return this.create(translationWithTimestamps);
    }
  }

  // Delete a translation
  async deleteTranslation(id: number): Promise<boolean> {
    return this.delete(id);
  }

  // Get all supported languages
  async getSupportedLanguages(): Promise<string[]> {
    const sql = "SELECT DISTINCT language FROM translations";
    const results = await this.query(sql, []);
    return results.map((row: any) => row.language);
  }

  // Get translations as a JSON object for a specific language
  async getTranslationsAsObject(language: string): Promise<Record<string, Record<string, string>>> {
    const translations = await this.getTranslationsByLanguage(language);
    
    const result: Record<string, Record<string, string>> = {};
    
    for (const translation of translations) {
      if (!result[translation.namespace]) {
        result[translation.namespace] = {};
      }
      
      result[translation.namespace][translation.key] = translation.value;
    }
    
    return result;
  }

  // Import translations from a JSON object
  async importTranslations(language: string, data: Record<string, Record<string, string>>): Promise<boolean> {
    try {
      for (const [namespace, translations] of Object.entries(data)) {
        for (const [key, value] of Object.entries(translations)) {
          await this.setTranslation({
            language,
            namespace,
            key,
            value
          });
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error importing translations:', error);
      return false;
    }
  }
}
