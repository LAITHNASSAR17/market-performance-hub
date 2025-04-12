
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

// Define a document type that extends NoteData with MongoDB fields
type NoteDocument = NoteData & mongoose.Document;

export async function getNoteById(id: string): Promise<NoteDocument | null> {
  await connectToDatabase();
  return Note.findById(id).lean().exec();
}

export async function getNotesByUserId(userId: string): Promise<NoteDocument[]> {
  await connectToDatabase();
  return Note.find({ userId }).lean().exec();
}

export async function createNote(noteData: NoteData): Promise<NoteDocument> {
  await connectToDatabase();
  const note = new Note(noteData);
  return note.save();
}

export async function updateNote(id: string, noteData: Partial<NoteData>): Promise<NoteDocument | null> {
  await connectToDatabase();
  return Note.findByIdAndUpdate(
    id,
    noteData,
    { new: true }
  ).lean().exec();
}

export async function deleteNote(id: string): Promise<NoteDocument | null> {
  await connectToDatabase();
  return Note.findByIdAndDelete(id).lean().exec();
}

export async function getAllNotes(): Promise<NoteDocument[]> {
  await connectToDatabase();
  return Note.find({}).lean().exec();
}
