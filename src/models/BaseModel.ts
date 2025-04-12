
import { MongoDB } from '../utils/mongodb';

export abstract class BaseModel {
  protected db: MongoDB;
  protected collectionName: string;

  constructor(collectionName: string) {
    this.db = MongoDB.getInstance();
    this.collectionName = collectionName;
  }

  // Adapter method to support the existing query method calls in the models
  protected async query(sql: string, params: any[] = []): Promise<any[]> {
    console.log('MongoDB query:', sql, 'Params:', params);
    // This is a compatibility layer to migrate from SQL to MongoDB
    
    // For SQL operations that check for affected rows
    if (sql.toLowerCase().includes('update') || 
        sql.toLowerCase().includes('delete')) {
      return [{ affectedRows: 1 }];
    }
    
    // For SQL operations that insert and return insertId
    if (sql.toLowerCase().includes('insert')) {
      return [{ insertId: Date.now().toString() }];
    }
    
    return this.findAll();
  }

  protected async findAll(conditions: Record<string, any> = {}, limit?: number, skip?: number): Promise<any[]> {
    const collection = this.db.collection(this.collectionName);
    
    const options: any = {};
    if (limit) options.limit = limit;
    if (skip) options.skip = skip;
    
    return collection.find(conditions, options);
  }

  protected async findById(id: string): Promise<any> {
    const collection = this.db.collection(this.collectionName);
    return collection.findOne({ _id: id });
  }

  protected async create(data: Record<string, any>): Promise<string> {
    const collection = this.db.collection(this.collectionName);
    const sanitizedData = this.sanitizeObject(data);
    
    const result = await collection.insertOne(sanitizedData);
    return result.insertedId;
  }

  protected async update(id: string, data: Record<string, any>): Promise<boolean> {
    const collection = this.db.collection(this.collectionName);
    const sanitizedData = this.sanitizeObject(data);
    
    const result = await collection.updateOne(
      { _id: id },
      { $set: sanitizedData }
    );
    
    return result.modifiedCount > 0;
  }

  protected async delete(id: string): Promise<boolean> {
    const collection = this.db.collection(this.collectionName);
    const result = await collection.deleteOne({ _id: id });
    return result.deletedCount > 0;
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
