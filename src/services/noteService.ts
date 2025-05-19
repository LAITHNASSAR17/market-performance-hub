
import { supabase } from '@/lib/supabase';

export const createNote = async (noteData: { 
  title: string;
  content: string;
  tags: string[];
  userId: string;
  tradeId?: string;
}) => {
  try {
    const note = {
      title: noteData.title,
      content: noteData.content,
      tags: noteData.tags,
      user_id: noteData.userId, // Convert camelCase to snake_case
      trade_id: noteData.tradeId // Add trade_id mapping
    };

    const { data, error } = await supabase
      .from('notes')
      .insert(note)
      .select();

    if (error) {
      console.error('Error creating note:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in createNote:', error);
    throw error;
  }
};

export const getNotesByUserId = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching notes:', error);
      throw error;
    }

    // Transform response to ensure consistent property names
    const formattedNotes = (data || []).map(note => ({
      id: note.id,
      title: note.title,
      content: note.content || '',
      tags: note.tags || [],
      userId: note.user_id,
      tradeId: note.trade_id || undefined,
      createdAt: note.created_at,
      updatedAt: note.updated_at
    }));

    return formattedNotes;
  } catch (error) {
    console.error('Error in getNotesByUserId:', error);
    throw error;
  }
};

export const getNoteById = async (noteId: string) => {
  try {
    const { data: note, error } = await supabase
      .from('notes')
      .select('*')
      .eq('id', noteId)
      .single();

    if (error) {
      console.error('Error fetching note:', error);
      throw error;
    }

    // Transform to ensure consistent property names
    return {
      id: note.id,
      title: note.title,
      content: note.content || '',
      tags: note.tags || [],
      userId: note.user_id,
      tradeId: note.trade_id || undefined,
      createdAt: note.created_at,
      updatedAt: note.updated_at
    };
  } catch (error) {
    console.error('Error in getNoteById:', error);
    throw error;
  }
};

export const updateNote = async (noteId: string, noteData: { 
  title?: string; 
  content?: string; 
  tags?: string[]; 
  tradeId?: string;
}) => {
  try {
    // Convert to database format with snake_case
    const updateData = {
      title: noteData.title,
      content: noteData.content,
      tags: noteData.tags,
      trade_id: noteData.tradeId
    };

    const { data, error } = await supabase
      .from('notes')
      .update(updateData)
      .eq('id', noteId)
      .select();

    if (error) {
      console.error('Error updating note:', error);
      throw error;
    }

    // Transform response to ensure consistent property names
    const formattedNotes = (data || []).map(note => ({
      id: note.id,
      title: note.title,
      content: note.content || '',
      tags: note.tags || [],
      userId: note.user_id,
      tradeId: note.trade_id || undefined,
      createdAt: note.created_at,
      updatedAt: note.updated_at
    }));

    return formattedNotes;
  } catch (error) {
    console.error('Error in updateNote:', error);
    throw error;
  }
};

export const deleteNote = async (noteId: string) => {
  try {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', noteId);

    if (error) {
      console.error('Error deleting note:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in deleteNote:', error);
    throw error;
  }
};
