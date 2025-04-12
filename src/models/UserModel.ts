
import { BaseModel } from './BaseModel';
import * as crypto from 'crypto-js';

export interface User {
  id: number;
  username: string;
  email: string;
  password?: string;
  isAdmin?: boolean;
  isBlocked: boolean;
  createdAt: Date;
  lastLogin?: Date;
  profileImage?: string;
}

export class UserModel extends BaseModel {
  constructor() {
    super('users');
  }

  async findById(id: number): Promise<User | null> {
    if (!this.validateNumber(id)) {
      throw new Error('Invalid user ID');
    }

    return super.findById(id);
  }

  async findByEmail(email: string): Promise<User | null> {
    if (!this.validateEmail(email)) {
      throw new Error('Invalid email');
    }

    const sql = 'SELECT * FROM users WHERE email = ? LIMIT 1';
    const result = await this.query(sql, [email]);
    return result[0] || null;
  }

  async findByUsername(username: string): Promise<User | null> {
    if (!this.validateString(username)) {
      throw new Error('Invalid username');
    }

    const sql = 'SELECT * FROM users WHERE username = ? LIMIT 1';
    const result = await this.query(sql, [username]);
    return result[0] || null;
  }

  async create(userData: Omit<User, 'id' | 'createdAt'>): Promise<number> {
    if (!this.validateString(userData.username) || !this.validateEmail(userData.email)) {
      throw new Error('Invalid user data');
    }

    // Password validation (if provided)
    if (userData.password && userData.password.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }

    const sanitizedData = this.sanitizeObject(userData) as Omit<User, 'id' | 'createdAt'>;
    
    // Hash password if provided
    if (sanitizedData.password) {
      sanitizedData.password = this.hashPassword(sanitizedData.password);
    }

    // Add current timestamp for createdAt
    const dataToInsert = {
      ...sanitizedData,
      createdAt: new Date().toISOString().slice(0, 19).replace('T', ' ')
    };

    const sql = 'INSERT INTO users (username, email, password, isAdmin, isBlocked, createdAt) VALUES (?, ?, ?, ?, ?, ?)';
    const result = await this.query(sql, [
      dataToInsert.username,
      dataToInsert.email,
      dataToInsert.password,
      dataToInsert.isAdmin || false,
      dataToInsert.isBlocked || false,
      dataToInsert.createdAt
    ]);

    return result.insertId;
  }

  async update(id: number, userData: Partial<User>): Promise<boolean> {
    if (!this.validateNumber(id)) {
      throw new Error('Invalid user ID');
    }

    // Validate email if provided
    if (userData.email && !this.validateEmail(userData.email)) {
      throw new Error('Invalid email');
    }

    // Validate username if provided
    if (userData.username && !this.validateString(userData.username)) {
      throw new Error('Invalid username');
    }

    // Sanitize data
    const sanitizedData = this.sanitizeObject(userData) as Partial<User>;
    
    // Hash password if provided
    if (sanitizedData.password) {
      if (sanitizedData.password.length < 8) {
        throw new Error('Password must be at least 8 characters');
      }
      sanitizedData.password = this.hashPassword(sanitizedData.password);
    }

    // Build SQL for update
    const updateFields: string[] = [];
    const values: any[] = [];

    Object.entries(sanitizedData).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'createdAt') {
        updateFields.push(`${key} = ?`);
        values.push(value);
      }
    });

    if (updateFields.length === 0) {
      return true; // Nothing to update
    }

    values.push(id); // Add ID for WHERE clause
    const sql = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;
    const result = await this.query(sql, values);

    return result.affectedRows > 0;
  }

  async updateLastLogin(id: number): Promise<boolean> {
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const sql = 'UPDATE users SET lastLogin = ? WHERE id = ?';
    const result = await this.query(sql, [now, id]);
    
    return result.affectedRows > 0;
  }

  async delete(id: number): Promise<boolean> {
    if (!this.validateNumber(id)) {
      throw new Error('Invalid user ID');
    }

    return super.delete(id);
  }

  async blockUser(id: number): Promise<boolean> {
    return this.update(id, { isBlocked: true });
  }

  async unblockUser(id: number): Promise<boolean> {
    return this.update(id, { isBlocked: false });
  }

  async validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return this.hashPassword(plainPassword) === hashedPassword;
  }

  private hashPassword(password: string): string {
    return crypto.SHA256(password).toString();
  }

  async getAllUsers(): Promise<User[]> {
    const sql = 'SELECT id, username, email, isAdmin, isBlocked, createdAt, lastLogin, profileImage FROM users';
    return this.query(sql);
  }
}
