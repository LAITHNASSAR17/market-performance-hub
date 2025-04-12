
import Note from '../models/Note';
import { connectToDatabase } from '../lib/mongodb';

export async function getNoteById(id: string) {
  await connectToDatabase();
  return Note.findById(id);
}

export async function getNotesByUserId(userId: string) {
  await connectToDatabase();
  return Note.find({ userId });
}

export async function createNote(noteData: any) {
  await connectToDatabase();
  return Note.create(noteData);
}

export async function updateNote(id: string, noteData: any) {
  await connectToDatabase();
  return Note.findByIdAndUpdate(id, noteData, { new: true });
}

export async function deleteNote(id: string) {
  await connectToDatabase();
  return Note.findByIdAndDelete(id);
}

export async function getAllNotes() {
  await connectToDatabase();
  return Note.find({});
}
