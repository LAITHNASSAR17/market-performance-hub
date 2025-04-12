
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

  async createUser(userData: Omit<User, 'id' | 'createdAt'>): Promise<number | null> {
    try {
      return await this.model.create(userData);
    } catch (error) {
      console.error('Error creating user:', error);
      return null;
    }
  }

  // Add other business logic methods...
}
