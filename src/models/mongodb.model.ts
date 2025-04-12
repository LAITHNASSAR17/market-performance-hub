
import { MongoDB } from '../utils/mongodb';
import type { MongoDBConfig } from '../utils/mongodb';

export type { MongoDBConfig };

export interface MongoDBCollection {
  name: string;
  documentCount: number;
}

export interface MongoDBQueryResult {
  success: boolean;
  data?: any;
  error?: string;
  insertedId?: string;
  modifiedCount?: number;
  deletedCount?: number;
}

// Model functions for handling MongoDB operations
export const MongoDBModel = {
  private: {
    db: MongoDB.getInstance(),
    config: null as MongoDBConfig | null,
    connectionStatus: 'disconnected' as 'disconnected' | 'connected' | 'error',
    collections: [] as MongoDBCollection[]
  },

  loadConfig: (): MongoDBConfig => {
    const savedConfig = localStorage.getItem('mongodbConfig');
    return savedConfig ? JSON.parse(savedConfig) : {
      connectionString: '',
      database: '',
      username: '',
      password: ''
    };
  },

  saveConfig: (config: MongoDBConfig): void => {
    localStorage.setItem('mongodbConfig', JSON.stringify(config));
    MongoDBModel.private.config = config;
  },

  isConfigValid: (config: MongoDBConfig): boolean => {
    return Boolean(
      config.connectionString && config.database
    );
  },

  loadConnectionStatus: (): 'disconnected' | 'connected' | 'error' => {
    return MongoDBModel.private.connectionStatus;
  },

  saveConnectionStatus: (status: 'disconnected' | 'connected' | 'error'): void => {
    MongoDBModel.private.connectionStatus = status;
    localStorage.setItem('mongodbConnectionStatus', status);
  },

  loadCollections: (): MongoDBCollection[] => {
    return MongoDBModel.private.collections;
  },

  saveCollections: (collections: MongoDBCollection[]): void => {
    MongoDBModel.private.collections = collections;
    localStorage.setItem('mongodbCollections', JSON.stringify(collections));
  },

  connect: async (): Promise<boolean> => {
    if (!MongoDBModel.private.config) return false;
    
    try {
      const connected = await MongoDBModel.private.db.connect(MongoDBModel.private.config);
      MongoDBModel.saveConnectionStatus(connected ? 'connected' : 'error');
      return connected;
    } catch (error) {
      MongoDBModel.saveConnectionStatus('error');
      return false;
    }
  },

  disconnect: (): void => {
    MongoDBModel.private.db.disconnect();
    MongoDBModel.saveConnectionStatus('disconnected');
  },

  executeQuery: async (
    collection: string, 
    operation: string, 
    query: any = {}, 
    update: any = null
  ): Promise<MongoDBQueryResult> => {
    try {
      if (!MongoDBModel.private.db.isConnected()) {
        return { 
          success: false, 
          error: 'Database not connected' 
        };
      }
      
      const coll = MongoDBModel.private.db.collection(collection);
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
};
