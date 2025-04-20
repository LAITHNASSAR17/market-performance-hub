
import { supabase } from '@/lib/supabase';
import { Note } from '@/types/settings';

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

  async createNote(noteData: Omit<Note, 'id' | 'created_at' | 'updated_at'>): Promise<INote> {
    const now = new Date().toISOString();
    
    // Make sure we use the correct field names for supabase
    const supabaseNote = {
      title: noteData.title,
      content: noteData.content,
      user_id: noteData.user_id,
      tags: noteData.tags || [],
      trade_id: noteData.trade_id
    };
    
    const { data, error } = await supabase
      .from('notes')
      .insert(supabaseNote)
      .select()
      .single();
    
    if (error || !data) throw new Error(`Error creating note: ${error?.message}`);
    return formatNote(data);
  },

  async updateNote(id: string, noteData: Partial<Note>): Promise<INote | null> {
    const now = new Date().toISOString();
    
    // Map properties correctly for Supabase
    const supabaseNote: Record<string, any> = {};
    if (noteData.title) supabaseNote.title = noteData.title;
    if (noteData.content) supabaseNote.content = noteData.content;
    if (noteData.tags) supabaseNote.tags = noteData.tags;
    if (noteData.trade_id) supabaseNote.trade_id = noteData.trade_id;
    
    supabaseNote.updated_at = now;
    
    const { data, error } = await supabase
      .from('notes')
      .update(supabaseNote)
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

  async findNotesByFilter(filter: Partial<Note>): Promise<INote[]> {
    let query = supabase.from('notes').select('*');
    
    // Apply filters dynamically
    Object.entries(filter).forEach(([key, value]) => {
      if (value !== undefined) {
        // Map to correct DB field names
        const dbField = key === 'userId' ? 'user_id' : 
                        key === 'tradeId' ? 'trade_id' : key;
        query = query.eq(dbField, value);
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
    content: data.content || '',
    tags: data.tags || [],
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at)
  };
}
