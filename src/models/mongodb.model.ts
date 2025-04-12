
import { MongoDB, MongoDBConfig } from '../utils/mongodb';

export { MongoDBConfig };

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
  }
};
