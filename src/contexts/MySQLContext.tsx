
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { MySQLConfig, MySQLTable, MySQLQueryResult } from '../models/mysql.model';
import { MySQLController } from '../controllers/mysql.controller';

interface MySQLContextType {
  config: MySQLConfig;
  connectionStatus: 'disconnected' | 'connected' | 'error';
  tables: MySQLTable[];
  isConfigured: boolean;
  setConfig: (config: MySQLConfig) => void;
  connect: () => Promise<boolean>;
  disconnect: () => void;
  executeQuery: (query: string) => Promise<MySQLQueryResult>;
  fetchTables: () => Promise<MySQLTable[]>;
  fetchTableStructure: (tableName: string) => Promise<any>;
  fetchTableData: (tableName: string, limit?: number) => Promise<any[]>;
}

const MySQLContext = createContext<MySQLContextType | undefined>(undefined);

export const MySQLProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<MySQLConfig>(() => MySQLController.loadConfig());
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connected' | 'error'>(
    MySQLController.loadConnectionStatus()
  );
  const [tables, setTables] = useState<MySQLTable[]>(() => MySQLController.loadTables());
  const { toast } = useToast();

  const isConfigured = Boolean(
    config.host && config.port && config.username && config.database
  );

  const connect = async (): Promise<boolean> => {
    if (!isConfigured) {
      toast({
        title: "Missing Configuration",
        description: "Please provide all required MySQL connection details",
        variant: "destructive"
      });
      return false;
    }

    toast({
      title: "Connecting...",
      description: `Attempting to connect to MySQL database ${config.database}`
    });

    try {
      const connected = await MySQLController.connect(config);
      
      if (connected) {
        const tables = await MySQLController.fetchTables();
        setTables(tables);
        setConnectionStatus('connected');
        
        toast({
          title: "Connection Successful",
          description: `Connected to ${config.database} on ${config.host}`
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
    MySQLController.disconnect();
    setConnectionStatus('disconnected');
    toast({
      title: "Disconnected",
      description: "Database connection closed"
    });
  };

  const executeQuery = async (query: string): Promise<MySQLQueryResult> => {
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
      description: "Processing SQL query..."
    });

    try {
      const result = await MySQLController.executeQuery(query);
      
      if (result.success) {
        let message = "Query executed successfully";
        if (result.affectedRows) {
          message = `Query affected ${result.affectedRows} row(s)`;
        } else if (result.data && Array.isArray(result.data)) {
          message = `Query returned ${result.data.length} result(s)`;
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

  const fetchTables = async (): Promise<MySQLTable[]> => {
    try {
      const fetchedTables = await MySQLController.fetchTables();
      setTables(fetchedTables);
      return fetchedTables;
    } catch (error) {
      console.error("Failed to fetch tables:", error);
      throw error;
    }
  };

  const fetchTableStructure = async (tableName: string) => {
    return MySQLController.fetchTableStructure(tableName);
  };

  const fetchTableData = async (tableName: string, limit = 100) => {
    return MySQLController.fetchTableData(tableName, limit);
  };

  return (
    <MySQLContext.Provider
      value={{
        config,
        connectionStatus,
        tables,
        isConfigured,
        setConfig,
        connect,
        disconnect,
        executeQuery,
        fetchTables,
        fetchTableStructure,
        fetchTableData
      }}
    >
      {children}
    </MySQLContext.Provider>
  );
};

export const useMySQL = () => {
  const context = useContext(MySQLContext);
  if (context === undefined) {
    throw new Error('useMySQL must be used within a MySQLProvider');
  }
  return context;
};
