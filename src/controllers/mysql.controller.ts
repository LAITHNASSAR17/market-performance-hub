

import { Database } from '../utils/database';
import { MySQLConfig, MySQLTable, MySQLTableColumn, MySQLQueryResult, MySQLModel } from '../models/mysql.model';

export class MySQLController {
  private static db = Database.getInstance();

  // Configuration methods
  static getConfig(): MySQLConfig {
    return MySQLModel.loadConfig();
  }

  static updateConfig(config: MySQLConfig): void {
    MySQLModel.saveConfig(config);
  }

  static getConnectionStatus(): 'disconnected' | 'connected' | 'error' {
    return MySQLModel.loadConnectionStatus();
  }

  static getTables(): MySQLTable[] {
    return MySQLModel.loadTables();
  }

  // Connection methods
  static async connect(config: MySQLConfig): Promise<boolean> {
    // Update config and try to connect
    MySQLModel.saveConfig(config);
    // Use the connect method without parameters since config is already saved
    const connected = await MySQLModel.connect();
    
    if (connected) {
      await this.fetchTables();
    }
    
    return connected;
  }

  static disconnect(): void {
    this.db.disconnect();
    MySQLModel.saveConnectionStatus('disconnected');
  }

  // Database operations
  static async executeQuery(query: string): Promise<MySQLQueryResult> {
    try {
      if (!this.db.isConnected()) {
        return { 
          success: false, 
          error: 'Database not connected' 
        };
      }
      
      const result = await this.db.query(query, []);
      
      return { 
        success: true, 
        data: result,
        affectedRows: result.affectedRows,
        insertId: result.insertId
      };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  static async fetchTables(): Promise<MySQLTable[]> {
    try {
      if (!this.db.isConnected()) {
        throw new Error('Database not connected');
      }
      
      const config = this.db.getConfig();
      if (!config) {
        throw new Error('Database configuration not found');
      }
      
      // Get list of tables in the database
      const query = "SELECT table_name AS name FROM information_schema.tables WHERE table_schema = ?";
      const result = await this.db.query(query, [config.database]);
      
      const tables: MySQLTable[] = [];
      
      // For each table, get column information and row count
      for (const table of result) {
        // Get column info
        const columnsQuery = "SHOW COLUMNS FROM `" + table.name + "`";
        const columnsResult = await this.db.query(columnsQuery, []);
        
        // Get row count
        const countQuery = "SELECT COUNT(*) as count FROM `" + table.name + "`";
        const countResult = await this.db.query(countQuery, []);
        
        // Build table info
        tables.push({
          name: table.name,
          columns: columnsResult.map((col: any) => col.Field),
          rowCount: countResult[0].count
        });
      }
      
      // Save tables to model
      MySQLModel.saveTables(tables);
      
      return tables;
    } catch (error) {
      console.error('Error fetching tables:', error);
      return [];
    }
  }

  static async fetchTableStructure(tableName: string): Promise<MySQLTableColumn[]> {
    try {
      if (!this.db.isConnected()) {
        throw new Error('Database not connected');
      }
      
      const query = "SHOW COLUMNS FROM `" + tableName + "`";
      const result = await this.db.query(query, []);
      
      return result.map((col: any) => ({
        name: col.Field,
        type: col.Type,
        nullable: col.Null === 'YES',
        key: col.Key,
        default: col.Default,
        extra: col.Extra
      }));
    } catch (error) {
      console.error('Error fetching table structure:', error);
      return [];
    }
  }

  static async fetchTableData(tableName: string, limit = 100): Promise<any[]> {
    try {
      if (!this.db.isConnected()) {
        throw new Error('Database not connected');
      }
      
      const query = "SELECT * FROM `" + tableName + "` LIMIT " + limit;
      return await this.db.query(query, []);
    } catch (error) {
      console.error('Error fetching table data:', error);
      return [];
    }
  }
}
