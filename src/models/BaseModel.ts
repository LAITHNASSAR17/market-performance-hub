
import { Database } from '../utils/database';

export abstract class BaseModel {
  protected db: Database;
  protected tableName: string;

  constructor(tableName: string) {
    this.db = Database.getInstance();
    this.tableName = tableName;
  }

  protected async query(sql: string, params: any[] = []): Promise<any> {
    return this.db.query(sql, params);
  }

  // Common CRUD operations that all models can use
  protected async findAll(conditions: Record<string, any> = {}, limit?: number, offset?: number): Promise<any[]> {
    let sql = `SELECT * FROM ${this.tableName}`;
    const params: any[] = [];
    
    // Add WHERE conditions if provided
    if (Object.keys(conditions).length > 0) {
      const whereConditions = Object.keys(conditions).map((key, index) => {
        params.push(conditions[key]);
        return `${key} = ?`;
      });
      sql += ` WHERE ${whereConditions.join(' AND ')}`;
    }
    
    // Add pagination if provided
    if (limit !== undefined) {
      sql += ` LIMIT ?`;
      params.push(limit);
      
      if (offset !== undefined) {
        sql += ` OFFSET ?`;
        params.push(offset);
      }
    }
    
    return this.query(sql, params);
  }

  protected async findById(id: number | string): Promise<any> {
    const sql = `SELECT * FROM ${this.tableName} WHERE id = ? LIMIT 1`;
    const result = await this.query(sql, [id]);
    return result[0] || null;
  }

  protected async create(data: Record<string, any>): Promise<number> {
    const columns = Object.keys(data).join(', ');
    const placeholders = Object.keys(data).map(() => '?').join(', ');
    const values = Object.values(data);
    
    const sql = `INSERT INTO ${this.tableName} (${columns}) VALUES (${placeholders})`;
    const result = await this.query(sql, values);
    
    return result.insertId;
  }

  protected async update(id: number | string, data: Record<string, any>): Promise<boolean> {
    const updates = Object.keys(data).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(data), id];
    
    const sql = `UPDATE ${this.tableName} SET ${updates} WHERE id = ?`;
    const result = await this.query(sql, values);
    
    return result.affectedRows > 0;
  }

  protected async delete(id: number | string): Promise<boolean> {
    const sql = `DELETE FROM ${this.tableName} WHERE id = ?`;
    const result = await this.query(sql, [id]);
    
    return result.affectedRows > 0;
  }

  // Common validation methods
  protected validateString(value: string): boolean {
    return typeof value === 'string' && value.length > 0;
  }

  protected validateNumber(value: number): boolean {
    return typeof value === 'number' && !isNaN(value);
  }

  protected validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  protected validateDate(date: string): boolean {
    return !isNaN(Date.parse(date));
  }

  protected sanitizeString(value: string): string {
    return value
      .replace(/[<>]/g, '') // Basic XSS protection
      .trim();
  }

  protected sanitizeObject(obj: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        sanitized[key] = this.sanitizeString(value);
      } else {
        sanitized[key] = value;
      }
    }
    
    return sanitized;
  }
}
