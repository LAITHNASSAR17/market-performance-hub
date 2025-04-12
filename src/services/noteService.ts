
import Note from '../models/Note';
import { connectToDatabase } from '../lib/mongodb';

export async function getNoteById(id: string) {
  await connectToDatabase();
  return Note.findById(id).exec();
}

export async function getNotesByUserId(userId: string) {
  await connectToDatabase();
  return Note.find({ userId }).exec();
}

export async function createNote(noteData: any) {
  await connectToDatabase();
  return Note.create(noteData);
}

export async function updateNote(id: string, noteData: any) {
  await connectToDatabase();
  return Note.findByIdAndUpdate(id, noteData, { new: true }).exec();
}

export async function deleteNote(id: string) {
  await connectToDatabase();
  return Note.findByIdAndDelete(id).exec();
}

export async function getAllNotes() {
  await connectToDatabase();
  return Note.find({}).exec();
}
