
import { MySQLConfig } from '../models/mysql.model';

export class Database {
  private static instance: Database;
  private connection: any = null;
  private config: MySQLConfig | null = null;
  private connected: boolean = false;

  private constructor() {}

  static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  async connect(config: MySQLConfig): Promise<boolean> {
    try {
      this.config = config;
      
      // In a real implementation, we would use mysqli or PDO
      // For now, we're using a mock connection for development
      this.connection = {
        connected: true,
        query: async (sql: string, params: any[] = []) => {
          console.log('SQL Query:', sql);
          console.log('Parameters:', params);
          
          // Return mock data for testing
          if (sql.includes('SELECT') && sql.includes('FROM users')) {
            return [{ id: 1, username: 'admin', email: 'admin@example.com', isBlocked: false, createdAt: new Date() }];
          }
          if (sql.includes('INSERT INTO')) {
            return { insertId: Date.now() };
          }
          return [];
        }
      };
      
      this.connected = true;
      return true;
    } catch (error) {
      console.error('Database connection error:', error);
      this.connected = false;
      return false;
    }
  }

  async query(sql: string, params: any[] = []): Promise<any> {
    if (!this.connection) {
      throw new Error('Database not connected');
    }
    
    // Basic SQL injection protection
    const sanitizedParams = params.map(param => 
      typeof param === 'string' ? 
        param.replace(/['"\\]/g, char => '\\' + char) : 
        param
    );

    try {
      return await this.connection.query(sql, sanitizedParams);
    } catch (error) {
      console.error('Query error:', error);
      throw error;
    }
  }

  disconnect(): void {
    if (this.connection) {
      // In a real implementation, we would close the connection
      this.connection = null;
      this.connected = false;
    }
  }

  isConnected(): boolean {
    return this.connected;
  }

  getConfig(): MySQLConfig | null {
    return this.config;
  }
}
