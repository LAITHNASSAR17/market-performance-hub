
import { UserModel, User } from '../models/UserModel';

export class UserController {
  private model: UserModel;

  constructor() {
    this.model = new UserModel();
  }

  async getUser(id: number): Promise<User | null> {
    try {
      return await this.model.findById(id);
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    try {
      return await this.model.findByEmail(email);
    } catch (error) {
      console.error('Error getting user by email:', error);
      return null;
    }
  }

  async createUser(userData: Omit<User, 'id' | 'createdAt'>): Promise<number | null> {
    try {
      // Additional business logic can be added here
      // For example, checking if email already exists
      const existingUser = await this.model.findByEmail(userData.email);
      if (existingUser) {
        throw new Error('Email already exists');
      }

      return await this.model.create(userData);
    } catch (error) {
      console.error('Error creating user:', error);
      return null;
    }
  }

  async updateUser(id: number, userData: Partial<User>): Promise<boolean> {
    try {
      // Business logic - check if user exists first
      const existingUser = await this.model.findById(id);
      if (!existingUser) {
        throw new Error('User not found');
      }

      return await this.model.update(id, userData);
    } catch (error) {
      console.error('Error updating user:', error);
      return false;
    }
  }

  async deleteUser(id: number): Promise<boolean> {
    try {
      // Business logic - check if user exists first
      const existingUser = await this.model.findById(id);
      if (!existingUser) {
        throw new Error('User not found');
      }

      return await this.model.delete(id);
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  }

  async blockUser(id: number): Promise<boolean> {
    try {
      return await this.model.blockUser(id);
    } catch (error) {
      console.error('Error blocking user:', error);
      return false;
    }
  }

  async unblockUser(id: number): Promise<boolean> {
    try {
      return await this.model.unblockUser(id);
    } catch (error) {
      console.error('Error unblocking user:', error);
      return false;
    }
  }

  async getAllUsers(): Promise<User[]> {
    try {
      return await this.model.getAllUsers();
    } catch (error) {
      console.error('Error getting all users:', error);
      return [];
    }
  }

  async authenticateUser(email: string, password: string): Promise<User | null> {
    try {
      const user = await this.model.findByEmail(email);
      
      if (!user) {
        return null; // User not found
      }
      
      if (user.isBlocked) {
        throw new Error('Account is blocked');
      }
      
      // Check password (assuming password is stored in the user object)
      if (user.password && await this.model.validatePassword(password, user.password)) {
        // Update last login time
        await this.model.updateLastLogin(user.id);
        
        // Remove password from returned user object
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword as User;
      }
      
      return null; // Invalid password
    } catch (error) {
      console.error('Error authenticating user:', error);
      return null;
    }
  }
}
