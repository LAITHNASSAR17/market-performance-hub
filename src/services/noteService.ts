
import { supabase } from '@/lib/supabase';

export interface INote {
  id?: string;
  title: string;
  content: string;
  tags?: string[];
  user_id: string; // Match the database column name
  created_at?: string;
  updated_at?: string;
}

export const noteService = {
  async getAllNotes(userId: string) {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching notes:', error);
      throw error;
    }
  },
  
  async getNoteById(id: string) {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching note:', error);
      throw error;
    }
  },
  
  async createNote(note: Omit<INote, 'id'>) {
    try {
      // Ensure we're using the correct field names for the DB
      const noteData: Omit<INote, 'id'> = {
        title: note.title,
        content: note.content,
        tags: note.tags || [],
        user_id: note.user_id, // Correctly use user_id instead of userId
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('notes')
        .insert(noteData)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating note:', error);
      throw error;
    }
  },
  
  async updateNote(id: string, note: Partial<Omit<INote, 'id'>>) {
    try {
      // Make sure to convert any userId to user_id
      const updateData: Partial<INote> = {
        ...note,
        updated_at: new Date().toISOString()
      };
      
      // Make sure we're using user_id, not userId
      if ('userId' in updateData) {
        updateData.user_id = (updateData as any).userId;
        delete (updateData as any).userId;
      }
      
      const { data, error } = await supabase
        .from('notes')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating note:', error);
      throw error;
    }
  },
  
  async deleteNote(id: string) {
    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting note:', error);
      throw error;
    }
  }
};
