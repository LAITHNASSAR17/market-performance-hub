import { MongoDB } from '../utils/mongodb';
import { MongoDBModel, MongoDBConfig, MongoDBCollection, MongoDBQueryResult } from '../models/mongodb.model';

export class MongoDBController {
  private static db = MongoDB.getInstance();

  // Configuration methods
  static getConfig(): MongoDBConfig {
    return MongoDBModel.loadConfig();
  }

  static updateConfig(config: MongoDBConfig): void {
    MongoDBModel.saveConfig(config);
  }

  static getConnectionStatus(): 'disconnected' | 'connected' | 'error' {
    return MongoDBModel.loadConnectionStatus();
  }

  static getCollections(): MongoDBCollection[] {
    return MongoDBModel.loadCollections();
  }

  // Connection methods
  static async connect(config: MongoDBConfig): Promise<boolean> {
    // Update config and try to connect
    MongoDBModel.saveConfig(config);
    const connected = await MongoDBModel.connect();
    
    if (connected) {
      await this.fetchCollections();
    }
    
    return connected;
  }

  static disconnect(): void {
    MongoDBModel.disconnect();
  }

  // Database operations
  static async executeQuery(
    collection: string, 
    operation: string, 
    query: any = {}, 
    update: any = null
  ): Promise<MongoDBQueryResult> {
    return MongoDBModel.executeQuery(collection, operation, query, update);
  }

  // Helper methods for common MongoDB operations
  static async findOne(collection: string, query: any): Promise<any> {
    const result = await this.executeQuery(collection, 'findOne', query);
    return result.success ? result.data : null;
  }

  static async find(collection: string, query: any = {}): Promise<any[]> {
    const result = await this.executeQuery(collection, 'find', query);
    return result.success ? result.data : [];
  }

  static async insertOne(collection: string, document: any): Promise<string | null> {
    const result = await this.executeQuery(collection, 'insertOne', document);
    return result.success ? result.insertedId : null;
  }

  static async updateOne(collection: string, query: any, update: any): Promise<boolean> {
    const result = await this.executeQuery(collection, 'updateOne', query, update);
    return result.success && (result.modifiedCount || 0) > 0;
  }

  static async deleteOne(collection: string, query: any): Promise<boolean> {
    const result = await this.executeQuery(collection, 'deleteOne', query);
    return result.success && (result.deletedCount || 0) > 0;
  }

  static async fetchCollections(): Promise<MongoDBCollection[]> {
    try {
      if (!this.db.isConnected()) {
        throw new Error('Database not connected');
      }
      
      const config = this.db.getConfig();
      if (!config) {
        throw new Error('Database configuration not found');
      }
      
      // In a real implementation, we would use MongoDB's listCollections command
      // For now, we'll use a mock implementation
      const collections: MongoDBCollection[] = [
        { name: 'users', documentCount: 10 },
        { name: 'trades', documentCount: 50 },
        { name: 'tags', documentCount: 25 },
        { name: 'settings', documentCount: 5 }
      ];
      
      // Save collections to model
      MongoDBModel.saveCollections(collections);
      
      return collections;
    } catch (error) {
      console.error('Error fetching collections:', error);
      return [];
    }
  }

  static async fetchCollectionSchema(collectionName: string): Promise<any[]> {
    try {
      if (!this.db.isConnected()) {
        throw new Error('Database not connected');
      }
      
      // In MongoDB, collections don't have a fixed schema
      // We can infer schema from a sample document
      const sample = await this.findOne(collectionName, {});
      
      if (!sample) {
        return [];
      }
      
      // Create a simple schema representation from the sample document
      return Object.entries(sample).map(([key, value]) => ({
        field: key,
        type: typeof value,
        example: String(value)
      }));
    } catch (error) {
      console.error('Error fetching collection schema:', error);
      return [];
    }
  }

  static async fetchCollectionData(collectionName: string, limit = 100): Promise<any[]> {
    try {
      if (!this.db.isConnected()) {
        throw new Error('Database not connected');
      }
      
      // Find documents with limit
      return await this.find(collectionName, {});
    } catch (error) {
      console.error('Error fetching collection data:', error);
      return [];
    }
  }
}
