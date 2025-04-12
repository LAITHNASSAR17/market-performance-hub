
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
  findOne: (collection: string, query: any) => Promise<any>;
  find: (collection: string, query?: any) => Promise<any[]>;
  insertOne: (collection: string, document: any) => Promise<string | null>;
  updateOne: (collection: string, query: any, update: any) => Promise<boolean>;
  deleteOne: (collection: string, query: any) => Promise<boolean>;
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
        description: "Please provide MongoDB connection details",
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
        setCollections(MongoDBController.getCollections());
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

  const executeQuery = async (
    collection: string, 
    operation: string, 
    query: any = {}, 
    update: any = null
  ): Promise<MongoDBQueryResult> => {
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
      description: `Processing ${operation} operation on ${collection}`
    });

    try {
      const result = await MongoDBController.executeQuery(collection, operation, query, update);
      
      if (result.success) {
        let message = "Operation executed successfully";
        if (operation === 'find' && result.data && Array.isArray(result.data)) {
          message = `Query returned ${result.data.length} result(s)`;
        } else if (operation === 'updateOne' && result.modifiedCount !== undefined) {
          message = `Modified ${result.modifiedCount} document(s)`;
        } else if (operation === 'deleteOne' && result.deletedCount !== undefined) {
          message = `Deleted ${result.deletedCount} document(s)`;
        } else if (operation === 'insertOne' && result.insertedId) {
          message = `Document inserted with ID: ${result.insertedId}`;
        }
        
        toast({
          title: "Operation Successful",
          description: message
        });
      } else {
        throw new Error(result.error);
      }
      
      return result;
    } catch (error) {
      toast({
        title: "Operation Failed",
        description: error instanceof Error ? error.message : "Failed to execute operation",
        variant: "destructive"
      });
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
  };

  // Helper methods that wrap the executeQuery method
  const findOne = async (collection: string, query: any): Promise<any> => {
    const result = await executeQuery(collection, 'findOne', query);
    return result.success ? result.data : null;
  };

  const find = async (collection: string, query: any = {}): Promise<any[]> => {
    const result = await executeQuery(collection, 'find', query);
    return result.success ? result.data : [];
  };

  const insertOne = async (collection: string, document: any): Promise<string | null> => {
    const result = await executeQuery(collection, 'insertOne', document);
    return result.success ? result.insertedId : null;
  };

  const updateOne = async (collection: string, query: any, update: any): Promise<boolean> => {
    const result = await executeQuery(collection, 'updateOne', query, update);
    return result.success && (result.modifiedCount || 0) > 0;
  };

  const deleteOne = async (collection: string, query: any): Promise<boolean> => {
    const result = await executeQuery(collection, 'deleteOne', query);
    return result.success && (result.deletedCount || 0) > 0;
  };

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
        findOne,
        find,
        insertOne,
        updateOne,
        deleteOne
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
