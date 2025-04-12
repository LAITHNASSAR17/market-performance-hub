
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { MongoDBModel, MongoDBConfig, MongoDBCollection, MongoDBQueryResult } from '../models/mongodb.model';

interface MongoDBContextType {
  isConnected: boolean;
  isConfigured: boolean;
  connectionStatus: 'disconnected' | 'connected' | 'error';
  config: MongoDBConfig;
  collections: MongoDBCollection[];
  setConfig: (config: MongoDBConfig) => void;
  connect: () => Promise<boolean>;
  disconnect: () => void;
  fetchCollections: () => Promise<void>;
  executeQuery: (query: string) => Promise<MongoDBQueryResult>;
}

const defaultConfig: MongoDBConfig = {
  connectionString: '',
  database: '',
  username: '',
  password: ''
};

const MongoDBContext = createContext<MongoDBContextType>({
  isConnected: false,
  isConfigured: false,
  connectionStatus: 'disconnected',
  config: defaultConfig,
  collections: [],
  setConfig: () => {},
  connect: async () => false,
  disconnect: () => {},
  fetchCollections: async () => {},
  executeQuery: async () => ({ success: false, error: 'Context not initialized' })
});

export const useMongoDBContext = () => useContext(MongoDBContext);

export const MongoDBProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<MongoDBConfig>(MongoDBModel.loadConfig());
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connected' | 'error'>(
    MongoDBModel.loadConnectionStatus()
  );
  const [collections, setCollections] = useState<MongoDBCollection[]>(MongoDBModel.loadCollections());

  // Check if config is valid
  const isConfigured = MongoDBModel.isConfigValid(config);
  
  // Save config when it changes
  useEffect(() => {
    MongoDBModel.saveConfig(config);
  }, [config]);

  // Connect to MongoDB
  const connect = async (): Promise<boolean> => {
    try {
      const connected = await MongoDBModel.connect();
      setConnectionStatus(connected ? 'connected' : 'error');
      
      if (connected) {
        await fetchCollections();
      }
      
      return connected;
    } catch (error) {
      console.error('Error connecting to MongoDB:', error);
      setConnectionStatus('error');
      return false;
    }
  };

  // Disconnect from MongoDB
  const disconnect = (): void => {
    // Implementation would depend on MongoDB library used
    setConnectionStatus('disconnected');
    setCollections([]);
    // Typically you would call some disconnect method here
  };

  // Fetch collections
  const fetchCollections = async (): Promise<void> => {
    try {
      // Fetch collections logic would be implemented here
      // For now, using mock data
      const mockCollections: MongoDBCollection[] = [
        { name: 'users', documentCount: 10 },
        { name: 'trades', documentCount: 25 },
        { name: 'settings', documentCount: 5 }
      ];
      
      setCollections(mockCollections);
      MongoDBModel.saveCollections(mockCollections);
    } catch (error) {
      console.error('Error fetching collections:', error);
    }
  };

  // Execute MongoDB query
  const executeQuery = async (query: string): Promise<MongoDBQueryResult> => {
    try {
      // Query execution logic would be implemented here
      // For now, returning mock success
      return {
        success: true,
        data: [{ result: 'Mock query executed successfully' }]
      };
    } catch (error) {
      console.error('Error executing query:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  };

  const value = {
    isConnected: connectionStatus === 'connected',
    isConfigured,
    connectionStatus,
    config,
    collections,
    setConfig,
    connect,
    disconnect,
    fetchCollections,
    executeQuery
  };

  return (
    <MongoDBContext.Provider value={value}>
      {children}
    </MongoDBContext.Provider>
  );
};

export const useMongoDB = () => useContext(MongoDBContext);
