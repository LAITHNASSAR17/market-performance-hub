
// MySQL Data Model - Handles database logic and data structures

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

export interface MySQLTableColumn {
  name: string;
  type: string;
  nullable: boolean;
  key: string;
  default: any;
  extra: string;
}

export interface MySQLQueryResult {
  success: boolean;
  data?: any;
  error?: string;
  affectedRows?: number;
  insertId?: number;
}

// Model functions for handling MySQL operations
export const MySQLModel = {
  // Load configuration from storage
  loadConfig: (): MySQLConfig => {
    const savedConfig = localStorage.getItem('mysqlConfig');
    return savedConfig ? JSON.parse(savedConfig) : {
      host: '',
      port: '3306',
      username: '',
      password: '',
      database: ''
    };
  },

  // Save configuration to storage
  saveConfig: (config: MySQLConfig): void => {
    localStorage.setItem('mysqlConfig', JSON.stringify(config));
  },

  // Check if configuration is valid
  isConfigValid: (config: MySQLConfig): boolean => {
    return Boolean(
      config.host && config.port && config.username && config.database
    );
  },

  // Load saved tables from storage
  loadTables: (): MySQLTable[] => {
    const savedTables = localStorage.getItem('mysqlTables');
    return savedTables ? JSON.parse(savedTables) : [];
  },

  // Save tables to storage
  saveTables: (tables: MySQLTable[]): void => {
    localStorage.setItem('mysqlTables', JSON.stringify(tables));
  },

  // Load connection status from storage
  loadConnectionStatus: (): 'disconnected' | 'connected' | 'error' => {
    const status = localStorage.getItem('mysqlConnectionStatus');
    return (status as 'disconnected' | 'connected' | 'error') || 'disconnected';
  },

  // Save connection status to storage
  saveConnectionStatus: (status: 'disconnected' | 'connected' | 'error'): void => {
    localStorage.setItem('mysqlConnectionStatus', status);
  }
};
