
import mongoose from 'mongoose';
import Note from '../models/Note';
import { connectToDatabase } from '../lib/mongodb';

// Define a proper interface for Note data
interface NoteData {
  userId: mongoose.Types.ObjectId | string;
  title: string;
  content: string;
  tradeId?: mongoose.Types.ObjectId | string | null;
  tags?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export async function getNoteById(id: string) {
  await connectToDatabase();
  return Note.findById(id);
}

export async function getNotesByUserId(userId: string) {
  await connectToDatabase();
  return Note.find({ userId });
}

export async function createNote(noteData: NoteData) {
  await connectToDatabase();
  const note = new Note(noteData);
  return note.save();
}

export async function updateNote(id: string, noteData: Partial<NoteData>) {
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
