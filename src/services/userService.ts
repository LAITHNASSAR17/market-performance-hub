
import User from '../models/User';
import { connectToDatabase } from '../lib/mongodb';

export async function getUserById(id: string) {
  await connectToDatabase();
  return User.findById(id).exec();
}

export async function getUserByEmail(email: string) {
  await connectToDatabase();
  return User.findOne({ email }).exec();
}

export async function createUser(userData: any) {
  await connectToDatabase();
  return User.create(userData);
}

export async function updateUser(id: string, userData: any) {
  await connectToDatabase();
  return User.findByIdAndUpdate(id, userData, { new: true }).exec();
}

export async function deleteUser(id: string) {
  await connectToDatabase();
  return User.findByIdAndDelete(id).exec();
}

export async function getAllUsers() {
  await connectToDatabase();
  return User.find({}).exec();
}
