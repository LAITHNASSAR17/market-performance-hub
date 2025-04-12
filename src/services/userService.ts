
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

export async function getUserById(id: string) {
  await connectToDatabase();
  return User.findById(id);
}

export async function getUserByEmail(email: string) {
  await connectToDatabase();
  return User.findOne({ email });
}

export async function createUser(userData: UserData) {
  await connectToDatabase();
  const user = new User(userData);
  return user.save();
}

export async function updateUser(id: string, userData: Partial<UserData>) {
  await connectToDatabase();
  return User.findByIdAndUpdate(id, userData, { new: true });
}

export async function deleteUser(id: string) {
  await connectToDatabase();
  return User.findByIdAndDelete(id);
}

export async function getAllUsers() {
  await connectToDatabase();
  return User.find({});
}
