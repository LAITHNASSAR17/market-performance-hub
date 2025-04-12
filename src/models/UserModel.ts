
import { BaseModel } from './BaseModel';

export interface User {
  id: number;
  username: string;
  email: string;
  isBlocked: boolean;
  createdAt: Date;
}

export class UserModel extends BaseModel {
  async findById(id: number): Promise<User | null> {
    if (!this.validateNumber(id)) {
      throw new Error('Invalid user ID');
    }

    const sql = 'SELECT * FROM users WHERE id = ? LIMIT 1';
    const result = await this.query(sql, [id]);
    return result[0] || null;
  }

  async create(userData: Omit<User, 'id' | 'createdAt'>): Promise<number> {
    if (!this.validateString(userData.username) || !this.validateString(userData.email)) {
      throw new Error('Invalid user data');
    }

    const sanitizedData = {
      username: this.sanitizeString(userData.username),
      email: this.sanitizeString(userData.email),
      isBlocked: Boolean(userData.isBlocked)
    };

    const sql = 'INSERT INTO users (username, email, is_blocked) VALUES (?, ?, ?)';
    const result = await this.query(sql, [
      sanitizedData.username,
      sanitizedData.email,
      sanitizedData.isBlocked
    ]);

    return result.insertId;
  }

  // Add other CRUD methods...
}
