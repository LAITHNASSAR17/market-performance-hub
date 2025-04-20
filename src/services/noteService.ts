
import { supabase } from '@/lib/supabase';

export interface INote {
  id: string;
  userId: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  tradeId?: string;
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
    // Map the interface fields to DB column names
    const dbData = {
      title: noteData.title,
      content: noteData.content,
      tags: noteData.tags,
      trade_id: noteData.tradeId,
      user_id: noteData.userId // Correctly map userId to user_id
    };
    
    const { data, error } = await supabase
      .from('notes')
      .insert(dbData)
      .select()
      .single();
    
    if (error || !data) throw new Error(`Error creating note: ${error?.message}`);
    return formatNote(data);
  },

  async updateNote(id: string, noteData: Partial<INote>): Promise<INote | null> {
    // Convert Note interface fields to database field names
    const updateData: any = { updated_at: new Date().toISOString() };
    if (noteData.title !== undefined) updateData.title = noteData.title;
    if (noteData.content !== undefined) updateData.content = noteData.content;
    if (noteData.tags !== undefined) updateData.tags = noteData.tags;
    if (noteData.tradeId !== undefined) updateData.trade_id = noteData.tradeId;
    if (noteData.userId !== undefined) updateData.user_id = noteData.userId;

    const { data, error } = await supabase
      .from('notes')
      .update(updateData)
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
    
    // Apply filters dynamically, converting camelCase to snake_case for DB columns
    if (filter.userId !== undefined) query = query.eq('user_id', filter.userId);
    if (filter.title !== undefined) query = query.eq('title', filter.title);
    if (filter.tradeId !== undefined) query = query.eq('trade_id', filter.tradeId);
    
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
    updatedAt: new Date(data.updated_at),
    tradeId: data.trade_id
  };
}
