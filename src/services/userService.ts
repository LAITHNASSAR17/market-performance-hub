
import mongoose from 'mongoose';
import User from '../models/User';
import { connectToDatabase } from '../lib/mongodb';

// Define a proper interface for User data
interface UserData {
  name: string;
  email: string;
  password: string;
  role?: 'user' | 'admin';
  createdAt?: Date;
}

export async function getUserById(id: string): Promise<UserData | null> {
  await connectToDatabase();
  // Use await directly on the method chain
  return await User.findById(id).lean();
}

export async function getUserByEmail(email: string): Promise<UserData | null> {
  await connectToDatabase();
  // Use await directly on the method chain
  return await User.findOne({ email }).lean();
}

export async function createUser(userData: UserData): Promise<UserData> {
  await connectToDatabase();
  // Create a new document instance and save it
  const user = new User(userData);
  return await user.save();
}

export async function updateUser(id: string, userData: Partial<UserData>): Promise<UserData | null> {
  await connectToDatabase();
  // Use await directly on the method chain
  return await User.findByIdAndUpdate(
    id, 
    userData, 
    { new: true }
  ).lean();
}

export async function deleteUser(id: string): Promise<UserData | null> {
  await connectToDatabase();
  // Use await directly on the method chain
  return await User.findByIdAndDelete(id).lean();
}

export async function getAllUsers(): Promise<UserData[]> {
  await connectToDatabase();
  // Use await directly on the method chain
  return await User.find({}).lean();
}
