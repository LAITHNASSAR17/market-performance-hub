
import { supabase } from '@/lib/supabase';

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
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !data) return null;
    return formatNote(data);
  },

  async getAllNotes(): Promise<INote[]> {
    const { data, error } = await supabase
      .from('notes')
      .select('*');
    
    if (error || !data) return [];
    return data.map(formatNote);
  },

  async createNote(noteData: Omit<INote, 'id' | 'createdAt' | 'updatedAt'>): Promise<INote> {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('notes')
      .insert({
        ...noteData,
        created_at: now,
        updated_at: now
      })
      .select()
      .single();
    
    if (error || !data) throw new Error(`Error creating note: ${error?.message}`);
    return formatNote(data);
  },

  async updateNote(id: string, noteData: Partial<INote>): Promise<INote | null> {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('notes')
      .update({
        ...noteData,
        updated_at: now
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error || !data) return null;
    return formatNote(data);
  },

  async deleteNote(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id);
    
    return !error;
  },

  async findNotesByFilter(filter: Partial<INote>): Promise<INote[]> {
    let query = supabase.from('notes').select('*');
    
    // Apply filters dynamically
    Object.entries(filter).forEach(([key, value]) => {
      if (value !== undefined) {
        query = query.eq(key, value);
      }
    });
    
    const { data, error } = await query;
    
    if (error || !data) return [];
    return data.map(formatNote);
  }
};

// Helper function to format Supabase data to our interface format
function formatNote(data: any): INote {
  return {
    id: data.id,
    userId: data.user_id,
    title: data.title,
    content: data.content,
    tags: data.tags || [],
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at)
  };
}
