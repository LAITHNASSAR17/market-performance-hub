
// MySQL Data Model - Handles database logic and data structures

import { Database } from '../utils/database';

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
  private: {
    db: Database.getInstance(),
    config: null as MySQLConfig | null,
    connectionStatus: 'disconnected' as 'disconnected' | 'connected' | 'error',
    tables: [] as MySQLTable[]
  },

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

  saveConfig: (config: MySQLConfig): void => {
    localStorage.setItem('mysqlConfig', JSON.stringify(config));
    MySQLModel.private.config = config;
  },

  isConfigValid: (config: MySQLConfig): boolean => {
    return Boolean(
      config.host && config.port && config.username && config.database
    );
  },

  loadConnectionStatus: (): 'disconnected' | 'connected' | 'error' => {
    return MySQLModel.private.connectionStatus;
  },

  saveConnectionStatus: (status: 'disconnected' | 'connected' | 'error'): void => {
    MySQLModel.private.connectionStatus = status;
    localStorage.setItem('mysqlConnectionStatus', status);
  },

  loadTables: (): MySQLTable[] => {
    return MySQLModel.private.tables;
  },

  saveTables: (tables: MySQLTable[]): void => {
    MySQLModel.private.tables = tables;
    localStorage.setItem('mysqlTables', JSON.stringify(tables));
  },

  connect: async (): Promise<boolean> => {
    if (!MySQLModel.private.config) return false;
    
    try {
      const connected = await MySQLModel.private.db.connect(MySQLModel.private.config);
      MySQLModel.saveConnectionStatus(connected ? 'connected' : 'error');
      return connected;
    } catch (error) {
      MySQLModel.saveConnectionStatus('error');
      return false;
    }
  }
};
