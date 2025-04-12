
import { MongoDB } from '../utils/mongodb';
import { MongoDBConfig, MongoDBCollection, MongoDBQueryResult, MongoDBModel } from '../models/mongodb.model';

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
    this.db.disconnect();
    MongoDBModel.saveConnectionStatus('disconnected');
  }

  // Database operations
  static async executeQuery(collection: string, operation: string, query: any = {}, update: any = null): Promise<MongoDBQueryResult> {
    try {
      if (!this.db.isConnected()) {
        return { 
          success: false, 
          error: 'Database not connected' 
        };
      }
      
      const coll = this.db.collection(collection);
      let result;
      
      switch (operation) {
        case 'find':
          result = await coll.find(query);
          return { success: true, data: result };
        
        case 'findOne':
          result = await coll.findOne(query);
          return { success: true, data: result };
        
        case 'insertOne':
          result = await coll.insertOne(query);
          return { 
            success: true, 
            data: result,
            insertedId: result.insertedId
          };
        
        case 'updateOne':
          if (!update) {
            return { success: false, error: 'Update document is required for updateOne operation' };
          }
          result = await coll.updateOne(query, update);
          return { 
            success: true, 
            data: result,
            modifiedCount: result.modifiedCount
          };
        
        case 'deleteOne':
          result = await coll.deleteOne(query);
          return { 
            success: true, 
            data: result,
            deletedCount: result.deletedCount
          };
        
        default:
          return { success: false, error: `Unsupported operation: ${operation}` };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  static async fetchCollections(): Promise<MongoDBCollection[]> {
    try {
      if (!this.db.isConnected()) {
        throw new Error('Database not connected');
      }
      
      // In a real implementation, we would fetch this from MongoDB
      // For now, we're using mock data
      const collections: MongoDBCollection[] = [
        { name: 'users', documentCount: 5 },
        { name: 'trades', documentCount: 15 },
        { name: 'notes', documentCount: 8 },
        { name: 'settings', documentCount: 1 }
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
      
      // In a real implementation, we would infer this from document structure
      // For now, we're using mock data
      if (collectionName === 'users') {
        return [
          { field: '_id', type: 'ObjectId', required: true },
          { field: 'username', type: 'String', required: true },
          { field: 'email', type: 'String', required: true },
          { field: 'password', type: 'String', required: true },
          { field: 'createdAt', type: 'Date', required: true }
        ];
      }
      
      return [];
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
      
      return await this.db.collection(collectionName).find({}, { limit });
    } catch (error) {
      console.error('Error fetching collection data:', error);
      return [];
    }
  }
}
