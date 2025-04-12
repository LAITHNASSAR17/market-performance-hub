
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
    // In a real implementation, we would convert SQL to MongoDB queries
    // For now, we'll return mock data based on the collection name
    return this.findAll();
  }

  protected async findAll(conditions: Record<string, any> = {}, limit?: number, skip?: number): Promise<any[]> {
    const collection = this.db.collection(this.collectionName);
    
    const options: any = {};
    if (limit) options.limit = limit;
    if (skip) options.skip = skip;
    
    return collection.find(conditions, options);
  }

  protected async findById(id: string | number): Promise<any> {
    const collection = this.db.collection(this.collectionName);
    // Convert number to string if needed to match MongoDB's string IDs
    const idStr = typeof id === 'number' ? id.toString() : id;
    return collection.findOne({ _id: idStr });
  }

  protected async create(data: Record<string, any>): Promise<string | number> {
    const collection = this.db.collection(this.collectionName);
    const sanitizedData = this.sanitizeObject(data);
    
    const result = await collection.insertOne(sanitizedData);
    return result.insertedId;
  }

  protected async update(id: string | number, data: Record<string, any>): Promise<boolean> {
    const collection = this.db.collection(this.collectionName);
    const sanitizedData = this.sanitizeObject(data);
    
    // Convert number to string if needed to match MongoDB's string IDs
    const idStr = typeof id === 'number' ? id.toString() : id;
    
    const result = await collection.updateOne(
      { _id: idStr },
      { $set: sanitizedData }
    );
    
    return result.modifiedCount > 0;
  }

  protected async delete(id: string | number): Promise<boolean> {
    const collection = this.db.collection(this.collectionName);
    
    // Convert number to string if needed to match MongoDB's string IDs
    const idStr = typeof id === 'number' ? id.toString() : id;
    
    const result = await collection.deleteOne({ _id: idStr });
    
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
