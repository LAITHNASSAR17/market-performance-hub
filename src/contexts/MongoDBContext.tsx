
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { MongoDBConfig, MongoDBCollection, MongoDBQueryResult } from '../models/mongodb.model';
import { MongoDBController } from '../controllers/mongodb.controller';

interface MongoDBContextType {
  config: MongoDBConfig;
  connectionStatus: 'disconnected' | 'connected' | 'error';
  collections: MongoDBCollection[];
  isConfigured: boolean;
  setConfig: (config: MongoDBConfig) => void;
  connect: () => Promise<boolean>;
  disconnect: () => void;
  executeQuery: (collection: string, operation: string, query?: any, update?: any) => Promise<MongoDBQueryResult>;
  fetchCollections: () => Promise<MongoDBCollection[]>;
  fetchCollectionSchema: (collectionName: string) => Promise<any>;
  fetchCollectionData: (collectionName: string, limit?: number) => Promise<any[]>;
}

const MongoDBContext = createContext<MongoDBContextType | undefined>(undefined);

export const MongoDBProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<MongoDBConfig>(MongoDBController.getConfig());
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connected' | 'error'>(
    MongoDBController.getConnectionStatus()
  );
  const [collections, setCollections] = useState<MongoDBCollection[]>(MongoDBController.getCollections());
  const { toast } = useToast();

  const isConfigured = Boolean(
    config.connectionString && config.database
  );

  // Update the controller when config changes
  useEffect(() => {
    MongoDBController.updateConfig(config);
  }, [config]);

  const connect = async (): Promise<boolean> => {
    if (!isConfigured) {
      toast({
        title: "Missing Configuration",
        description: "Please provide all required MongoDB connection details",
        variant: "destructive"
      });
      return false;
    }

    toast({
      title: "Connecting...",
      description: `Attempting to connect to MongoDB database ${config.database}`
    });

    try {
      const connected = await MongoDBController.connect(config);
      
      if (connected) {
        const collections = await MongoDBController.fetchCollections();
        setCollections(collections);
        setConnectionStatus('connected');
        
        toast({
          title: "Connection Successful",
          description: `Connected to ${config.database}`
        });
      } else {
        throw new Error("Connection failed");
      }
      
      return connected;
    } catch (error) {
      setConnectionStatus('error');
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Could not connect to database",
        variant: "destructive"
      });
      return false;
    }
  };

  const disconnect = () => {
    MongoDBController.disconnect();
    setConnectionStatus('disconnected');
    toast({
      title: "Disconnected",
      description: "Database connection closed"
    });
  };

  const executeQuery = async (collection: string, operation: string, query: any = {}, update: any = null): Promise<MongoDBQueryResult> => {
    if (connectionStatus !== 'connected') {
      toast({
        title: "Not Connected",
        description: "Please connect to the database first",
        variant: "destructive"
      });
      throw new Error("Database not connected");
    }

    toast({
      title: "Executing Query",
      description: `Processing ${operation} operation on ${collection} collection...`
    });

    try {
      const result = await MongoDBController.executeQuery(collection, operation, query, update);
      
      if (result.success) {
        let message = "Query executed successfully";
        if (result.insertedId) {
          message = `Document inserted with ID: ${result.insertedId}`;
        } else if (result.modifiedCount) {
          message = `Modified ${result.modifiedCount} document(s)`;
        } else if (result.deletedCount) {
          message = `Deleted ${result.deletedCount} document(s)`;
        } else if (result.data) {
          if (Array.isArray(result.data)) {
            message = `Query returned ${result.data.length} document(s)`;
          } else {
            message = "Query returned a document";
          }
        }
        
        toast({
          title: "Query Executed",
          description: message
        });
      } else {
        throw new Error(result.error);
      }
      
      return result;
    } catch (error) {
      toast({
        title: "Query Failed",
        description: error instanceof Error ? error.message : "Failed to execute query",
        variant: "destructive"
      });
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
  };

  const fetchCollections = async (): Promise<MongoDBCollection[]> => {
    try {
      const fetchedCollections = await MongoDBController.fetchCollections();
      setCollections(fetchedCollections);
      return fetchedCollections;
    } catch (error) {
      console.error("Failed to fetch collections:", error);
      throw error;
    }
  };

  const fetchCollectionSchema = async (collectionName: string) => {
    return MongoDBController.fetchCollectionSchema(collectionName);
  };

  const fetchCollectionData = async (collectionName: string, limit = 100) => {
    return MongoDBController.fetchCollectionData(collectionName, limit);
  };

  // Update state when connection status changes
  useEffect(() => {
    setConnectionStatus(MongoDBController.getConnectionStatus());
  }, []);

  return (
    <MongoDBContext.Provider
      value={{
        config,
        connectionStatus,
        collections,
        isConfigured,
        setConfig,
        connect,
        disconnect,
        executeQuery,
        fetchCollections,
        fetchCollectionSchema,
        fetchCollectionData
      }}
    >
      {children}
    </MongoDBContext.Provider>
  );
};

export const useMongoDB = () => {
  const context = useContext(MongoDBContext);
  if (context === undefined) {
    throw new Error('useMongoDB must be used within a MongoDBProvider');
  }
  return context;
};
