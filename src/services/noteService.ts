import { supabase } from '@/lib/supabase';

export const createNote = async (noteData: { 
  title: string;
  content: string;
  tags: string[];
  userId: string;
}) => {
  const note = {
    title: noteData.title,
    content: noteData.content,
    tags: noteData.tags,
    user_id: noteData.userId // Convert camelCase to snake_case
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
};

export const getNotesByUserId = async (userId: string) => {
  const { data: notes, error } = await supabase
    .from('notes')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching notes:', error);
    throw error;
  }

  return notes || [];
};

export const getNoteById = async (noteId: string) => {
  const { data: note, error } = await supabase
    .from('notes')
    .select('*')
    .eq('id', noteId)
    .single();

  if (error) {
    console.error('Error fetching note:', error);
    throw error;
  }

  return note;
};

export const updateNote = async (noteId: string, noteData: { title?: string; content?: string; tags?: string[] }) => {
  const { data, error } = await supabase
    .from('notes')
    .update(noteData)
    .eq('id', noteId)
    .select();

  if (error) {
    console.error('Error updating note:', error);
    throw error;
  }

  return data;
};

export const deleteNote = async (noteId: string) => {
  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('id', noteId);

  if (error) {
    console.error('Error deleting note:', error);
    throw error;
  }
};
