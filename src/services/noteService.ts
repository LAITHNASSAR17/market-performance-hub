
import { Note } from '../models/Note';

export interface INote {
  id: string;
  userId: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export const noteService = {
  async getNoteById(id: string): Promise<INote | null> {
    return await Note.findById(id).exec();
  },

  async getAllNotes(): Promise<INote[]> {
    return await Note.find().exec();
  },

  async createNote(noteData: Omit<INote, 'id' | 'createdAt' | 'updatedAt'>): Promise<INote> {
    const note = new Note(noteData);
    return await note.save();
  },

  async updateNote(id: string, noteData: Partial<INote>): Promise<INote | null> {
    return await Note.findByIdAndUpdate(id, noteData, { new: true }).exec();
  },

  async deleteNote(id: string): Promise<boolean> {
    const result = await Note.findByIdAndDelete(id).exec();
    return !!result;
  },

  async findNotesByFilter(filter: Partial<INote>): Promise<INote[]> {
    return await Note.find(filter).exec();
  }
};
