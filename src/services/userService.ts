
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

// Define a document type that extends UserData with MongoDB fields
type UserDocument = UserData & mongoose.Document;

export async function getUserById(id: string): Promise<UserDocument | null> {
  await connectToDatabase();
  return User.findById(id).lean().exec();
}

export async function getUserByEmail(email: string): Promise<UserDocument | null> {
  await connectToDatabase();
  return User.findOne({ email }).lean().exec();
}

export async function createUser(userData: UserData): Promise<UserDocument> {
  await connectToDatabase();
  const user = new User(userData);
  return user.save();
}

export async function updateUser(id: string, userData: Partial<UserData>): Promise<UserDocument | null> {
  await connectToDatabase();
  return User.findByIdAndUpdate(
    id, 
    userData, 
    { new: true }
  ).lean().exec();
}

export async function deleteUser(id: string): Promise<UserDocument | null> {
  await connectToDatabase();
  return User.findByIdAndDelete(id).lean().exec();
}

export async function getAllUsers(): Promise<UserDocument[]> {
  await connectToDatabase();
  return User.find({}).lean().exec();
}
