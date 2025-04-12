
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

export async function getNoteById(id: string): Promise<NoteData | null> {
  await connectToDatabase();
  // Use await directly on the method chain
  return await Note.findById(id).lean();
}

export async function getNotesByUserId(userId: string): Promise<NoteData[]> {
  await connectToDatabase();
  // Use await directly on the method chain
  return await Note.find({ userId }).lean();
}

export async function createNote(noteData: NoteData): Promise<NoteData> {
  await connectToDatabase();
  // Create a new document instance and save it
  const note = new Note(noteData);
  return await note.save();
}

export async function updateNote(id: string, noteData: Partial<NoteData>): Promise<NoteData | null> {
  await connectToDatabase();
  // Use await directly on the method chain
  return await Note.findByIdAndUpdate(
    id,
    noteData,
    { new: true }
  ).lean();
}

export async function deleteNote(id: string): Promise<NoteData | null> {
  await connectToDatabase();
  // Use await directly on the method chain
  return await Note.findByIdAndDelete(id).lean();
}

export async function getAllNotes(): Promise<NoteData[]> {
  await connectToDatabase();
  // Use await directly on the method chain
  return await Note.find({}).lean();
}
