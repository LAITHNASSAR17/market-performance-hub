
import { User } from '../models/User';

export interface IUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: string;
  isBlocked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const userService = {
  async getUserById(id: string): Promise<IUser | null> {
    return await User.findById(id).exec();
  },

  async getAllUsers(): Promise<IUser[]> {
    return await User.find().exec();
  },

  async createUser(userData: Omit<IUser, 'id' | 'createdAt' | 'updatedAt'>): Promise<IUser> {
    const user = new User(userData);
    return await user.save();
  },

  async updateUser(id: string, userData: Partial<IUser>): Promise<IUser | null> {
    return await User.findByIdAndUpdate(id, userData, { new: true }).exec();
  },

  async deleteUser(id: string): Promise<boolean> {
    const result = await User.findByIdAndDelete(id).exec();
    return !!result;
  },

  async findUsersByFilter(filter: Partial<IUser>): Promise<IUser[]> {
    return await User.find(filter).exec();
  }
};
