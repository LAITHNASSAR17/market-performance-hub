
import { Database } from '../utils/database';

export abstract class BaseModel {
  protected db: Database;

  constructor() {
    this.db = Database.getInstance();
  }

  protected async query(sql: string, params: any[] = []): Promise<any> {
    return this.db.query(sql, params);
  }

  // Common validation methods
  protected validateString(value: string): boolean {
    return typeof value === 'string' && value.length > 0;
  }

  protected validateNumber(value: number): boolean {
    return typeof value === 'number' && !isNaN(value);
  }

  protected sanitizeString(value: string): string {
    return value
      .replace(/[<>]/g, '') // Basic XSS protection
      .trim();
  }
}
