
// This file is a temporary solution for import errors
// It will be removed once we complete the migration to MongoDB

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
  default: string | null;
  extra: string;
}

export interface MySQLQueryResult {
  success: boolean;
  data?: any;
  error?: string;
  affectedRows?: number;
  insertId?: number | string;
}

export const MySQLModel = {
  loadConfig: (): MySQLConfig => {
    return {
      host: '',
      port: '',
      username: '',
      password: '',
      database: ''
    };
  },
  
  saveConfig: () => {},
  
  loadConnectionStatus: (): 'disconnected' | 'connected' | 'error' => {
    return 'disconnected';
  },
  
  loadTables: (): MySQLTable[] => {
    return [];
  },
  
  saveConnectionStatus: () => {},
  
  saveTables: () => {},
  
  connect: async (): Promise<boolean> => {
    return false;
  }
};
