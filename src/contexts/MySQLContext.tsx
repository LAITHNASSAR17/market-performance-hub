
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface MySQLConfig {
  host: string;
  port: string;
  username: string;
  password: string;
  database: string;
}

export interface MySQLTable {
  name: string;
  columns: string[];
  rowCount: number;
}

interface MySQLContextType {
  config: MySQLConfig;
  connectionStatus: 'disconnected' | 'connected' | 'error';
  tables: MySQLTable[];
  isConfigured: boolean;
  setConfig: (config: MySQLConfig) => void;
  connect: () => Promise<boolean>;
  disconnect: () => void;
  executeQuery: (query: string) => Promise<any>;
  fetchTables: () => Promise<MySQLTable[]>;
  fetchTableStructure: (tableName: string) => Promise<any>;
  fetchTableData: (tableName: string, limit?: number) => Promise<any[]>;
}

const defaultConfig: MySQLConfig = {
  host: '',
  port: '3306',
  username: '',
  password: '',
  database: ''
};

const MySQLContext = createContext<MySQLContextType | undefined>(undefined);

export const MySQLProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<MySQLConfig>(() => {
    const savedConfig = localStorage.getItem('mysqlConfig');
    return savedConfig ? JSON.parse(savedConfig) : defaultConfig;
  });
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connected' | 'error'>('disconnected');
  const [tables, setTables] = useState<MySQLTable[]>([]);
  const { toast } = useToast();

  // Check if a saved connection exists on load
  useEffect(() => {
    const savedStatus = localStorage.getItem('mysqlConnectionStatus');
    if (savedStatus === 'connected') {
      // This would actually check the connection in a real implementation
      // Here we just simulate a connection check
      setConnectionStatus('connected');
      const savedTables = localStorage.getItem('mysqlTables');
      if (savedTables) {
        setTables(JSON.parse(savedTables));
      }
    }
  }, []);

  // Save any config changes to localStorage
  useEffect(() => {
    localStorage.setItem('mysqlConfig', JSON.stringify(config));
  }, [config]);

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

    // In a real implementation, this would actually connect to MySQL
    // Here we're just simulating the connection
    toast({
      title: "Connecting...",
      description: `Attempting to connect to MySQL database ${config.database}`
    });

    try {
      // Simulate connection delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Sample tables for demonstration
      const mockTables: MySQLTable[] = [
        { name: 'users', columns: ['id', 'name', 'email', 'password', 'created_at'], rowCount: 25 },
        { name: 'trades', columns: ['id', 'user_id', 'symbol', 'type', 'amount', 'price', 'date'], rowCount: 158 },
        { name: 'notes', columns: ['id', 'user_id', 'title', 'content', 'created_at'], rowCount: 87 },
        { name: 'settings', columns: ['id', 'user_id', 'key', 'value'], rowCount: 12 },
        { name: 'logs', columns: ['id', 'user_id', 'action', 'details', 'timestamp'], rowCount: 436 },
      ];
      
      setTables(mockTables);
      setConnectionStatus('connected');
      
      // Save connection info
      localStorage.setItem('mysqlConnectionStatus', 'connected');
      localStorage.setItem('mysqlTables', JSON.stringify(mockTables));
      
      toast({
        title: "Connection Successful",
        description: `Connected to ${config.database} on ${config.host}`
      });
      
      return true;
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
    setConnectionStatus('disconnected');
    localStorage.setItem('mysqlConnectionStatus', 'disconnected');
    toast({
      title: "Disconnected",
      description: "Database connection closed"
    });
  };

  const executeQuery = async (query: string): Promise<any> => {
    if (connectionStatus !== 'connected') {
      toast({
        title: "Not Connected",
        description: "Please connect to the database first",
        variant: "destructive"
      });
      throw new Error("Database not connected");
    }

    // In a real implementation, this would execute the query
    // Here we're just simulating the execution
    toast({
      title: "Executing Query",
      description: "Processing SQL query..."
    });

    // Simulate execution delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock results based on query type
    if (query.toLowerCase().includes('select')) {
      // Mock select query result
      const mockResults = Array(10).fill(null).map((_, i) => ({
        id: i + 1,
        name: `Item ${i + 1}`,
        created_at: new Date().toISOString()
      }));
      
      toast({
        title: "Query Executed",
        description: `Query returned ${mockResults.length} results`
      });
      
      return mockResults;
    } else if (query.toLowerCase().includes('insert')) {
      toast({
        title: "Query Executed",
        description: "Insert successful, 1 row affected"
      });
      return { affectedRows: 1, insertId: Math.floor(Math.random() * 1000) };
    } else if (query.toLowerCase().includes('update')) {
      toast({
        title: "Query Executed",
        description: "Update successful, 2 rows affected"
      });
      return { affectedRows: 2 };
    } else if (query.toLowerCase().includes('delete')) {
      toast({
        title: "Query Executed",
        description: "Delete successful, 1 row affected"
      });
      return { affectedRows: 1 };
    } else {
      toast({
        title: "Query Executed",
        description: "Query executed successfully"
      });
      return { success: true };
    }
  };

  const fetchTables = async (): Promise<MySQLTable[]> => {
    if (connectionStatus !== 'connected') {
      throw new Error("Database not connected");
    }
    
    // In a real implementation, this would fetch tables from MySQL
    // Here we're just returning the stored tables
    return tables;
  };

  const fetchTableStructure = async (tableName: string): Promise<any> => {
    if (connectionStatus !== 'connected') {
      throw new Error("Database not connected");
    }
    
    // Find the table
    const table = tables.find(t => t.name === tableName);
    if (!table) {
      throw new Error(`Table ${tableName} not found`);
    }
    
    // Mock structure result with column details
    return table.columns.map(column => ({
      name: column,
      type: column.includes('id') ? 'INT' : 
            column.includes('name') || column.includes('title') ? 'VARCHAR(255)' :
            column.includes('content') ? 'TEXT' :
            column.includes('date') || column.includes('created_at') ? 'DATETIME' :
            'VARCHAR(100)',
      nullable: !column.includes('id'),
      key: column === 'id' ? 'PRI' : '',
      default: null,
      extra: column === 'id' ? 'auto_increment' : ''
    }));
  };

  const fetchTableData = async (tableName: string, limit = 100): Promise<any[]> => {
    if (connectionStatus !== 'connected') {
      throw new Error("Database not connected");
    }
    
    // Find the table
    const table = tables.find(t => t.name === tableName);
    if (!table) {
      throw new Error(`Table ${tableName} not found`);
    }
    
    // Mock data based on table structure
    const count = Math.min(limit, 20); // Max 20 rows for mock data
    
    const mockData = Array(count).fill(null).map((_, i) => {
      const row: Record<string, any> = {};
      
      table.columns.forEach(column => {
        if (column === 'id') {
          row[column] = i + 1;
        } else if (column.includes('user_id')) {
          row[column] = Math.floor(Math.random() * 10) + 1;
        } else if (column === 'name') {
          row[column] = `User ${i + 1}`;
        } else if (column === 'email') {
          row[column] = `user${i + 1}@example.com`;
        } else if (column === 'title') {
          row[column] = `Sample ${tableName} ${i + 1}`;
        } else if (column === 'content') {
          row[column] = `This is sample content for ${tableName} record ${i + 1}`;
        } else if (column.includes('date') || column.includes('timestamp') || column.includes('created_at')) {
          row[column] = new Date(Date.now() - Math.random() * 10000000000).toISOString();
        } else if (column === 'type') {
          row[column] = Math.random() > 0.5 ? 'Buy' : 'Sell';
        } else if (column === 'amount' || column === 'price') {
          row[column] = (Math.random() * 1000).toFixed(2);
        } else if (column === 'symbol') {
          const symbols = ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD'];
          row[column] = symbols[Math.floor(Math.random() * symbols.length)];
        } else {
          row[column] = `Value for ${column} ${i + 1}`;
        }
      });
      
      return row;
    });
    
    return mockData;
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
