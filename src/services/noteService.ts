import { supabase } from '@/lib/supabase';

export interface INote {
  id: string;
  userId: string;
  title: string;
  content: string;
  folderId?: string;
  templateId?: string;
  isFavorite: boolean;
  tags: string[];
  tradeData?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface IFolder {
  id: string;
  userId: string;
  name: string;
  color?: string;
  icon?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITemplate {
  id: string;
  userId?: string;
  title: string;
  content: string;
  isDefault: boolean;
  isFavorite: boolean;
  category: string;
  createdAt: Date;
  updatedAt: Date;
}

export const noteService = {
  // Notes operations
  async getNoteById(id: string): Promise<INote | null> {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single();
    
    if (error || !data) return null;
    return formatNote(data);
  },

  async getAllNotes(userId?: string): Promise<INote[]> {
    if (!userId) {
      const { data: { user } } = await supabase.auth.getUser();
      userId = user?.id;
    }

    if (!userId) return [];

    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('updated_at', { ascending: false });
    
    if (error || !data) return [];
    return data.map(formatNote);
  },

  async getNotesByFolder(folderId: string): Promise<INote[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', user.id)
      .eq('folder_id', folderId)
      .is('deleted_at', null)
      .order('updated_at', { ascending: false });
    
    if (error || !data) return [];
    return data.map(formatNote);
  },

  async getFavoritedNotes(): Promise<INote[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_favorite', true)
      .is('deleted_at', null)
      .order('updated_at', { ascending: false });
    
    if (error || !data) return [];
    return data.map(formatNote);
  },

  async getNotesByTag(tag: string): Promise<INote[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', user.id)
      .contains('tags', [tag])
      .is('deleted_at', null)
      .order('updated_at', { ascending: false });
    
    if (error || !data) return [];
    return data.map(formatNote);
  },

  async createNote(noteData: Omit<INote, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<INote> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('notes')
      .insert({
        title: noteData.title,
        content: noteData.content,
        folder_id: noteData.folderId || null,
        template_id: noteData.templateId || null,
        is_favorite: noteData.isFavorite || false,
        tags: noteData.tags || [],
        trade_data: noteData.tradeData || null,
        user_id: user.id,
        created_at: now,
        updated_at: now
      })
      .select()
      .single();
    
    if (error || !data) throw new Error(`Error creating note: ${error?.message}`);
    return formatNote(data);
  },

  async updateNote(id: string, noteData: Partial<INote>): Promise<INote | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const updateData: any = {};
    if (noteData.title !== undefined) updateData.title = noteData.title;
    if (noteData.content !== undefined) updateData.content = noteData.content;
    if (noteData.folderId !== undefined) updateData.folder_id = noteData.folderId;
    if (noteData.templateId !== undefined) updateData.template_id = noteData.templateId;
    if (noteData.isFavorite !== undefined) updateData.is_favorite = noteData.isFavorite;
    if (noteData.tags !== undefined) updateData.tags = noteData.tags;
    if (noteData.tradeData !== undefined) updateData.trade_data = noteData.tradeData;

    const now = new Date().toISOString();
    updateData.updated_at = now;

    const { data, error } = await supabase
      .from('notes')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .select()
      .single();
    
    if (error || !data) return null;
    return formatNote(data);
  },

  async deleteNote(id: string, permanent: boolean = false): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    if (permanent) {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      return !error;
    } else {
      const now = new Date().toISOString();
      const { error } = await supabase
        .from('notes')
        .update({ deleted_at: now })
        .eq('id', id)
        .eq('user_id', user.id)
        .is('deleted_at', null);
      
      return !error;
    }
  },

  // Folders operations
  async getAllFolders(): Promise<IFolder[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('note_folders')
      .select('*')
      .eq('user_id', user.id)
      .order('name', { ascending: true });
    
    if (error || !data) return [];
    return data.map(formatFolder);
  },

  async createFolder(name: string, color?: string, icon?: string): Promise<IFolder | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('note_folders')
      .insert({
        name,
        color,
        icon,
        user_id: user.id
      })
      .select()
      .single();
    
    if (error || !data) return null;
    return formatFolder(data);
  },

  async updateFolder(id: string, name: string, color?: string, icon?: string): Promise<IFolder | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('note_folders')
      .update({
        name,
        color,
        icon,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();
    
    if (error || !data) return null;
    return formatFolder(data);
  },

  async deleteFolder(id: string): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
      .from('note_folders')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);
    
    return !error;
  },

  // Templates operations
  async getAllTemplates(): Promise<ITemplate[]> {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('note_templates')
      .select('*')
      .or(`user_id.eq.${user?.id},is_default.eq.true`)
      .order('title', { ascending: true });
    
    if (error || !data) return [];
    return data.map(formatTemplate);
  },

  async createTemplate(templateData: Omit<ITemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<ITemplate | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('note_templates')
      .insert({
        title: templateData.title,
        content: templateData.content,
        is_default: false,
        is_favorite: templateData.isFavorite || false,
        category: templateData.category || 'custom',
        user_id: user.id
      })
      .select()
      .single();
    
    if (error || !data) return null;
    return formatTemplate(data);
  },

  async updateTemplate(id: string, templateData: Partial<ITemplate>): Promise<ITemplate | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const updateData: any = {};
    if (templateData.title !== undefined) updateData.title = templateData.title;
    if (templateData.content !== undefined) updateData.content = templateData.content;
    if (templateData.isFavorite !== undefined) updateData.is_favorite = templateData.isFavorite;
    if (templateData.category !== undefined) updateData.category = templateData.category;
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('note_templates')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();
    
    if (error || !data) return null;
    return formatTemplate(data);
  },

  async deleteTemplate(id: string): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
      .from('note_templates')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);
    
    return !error;
  },

  // Search
  async searchNotes(query: string): Promise<INote[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
      .order('updated_at', { ascending: false });
    
    if (error || !data) return [];
    return data.map(formatNote);
  }
};

function formatNote(data: any): INote {
  return {
    id: data.id,
    userId: data.user_id,
    title: data.title,
    content: data.content,
    folderId: data.folder_id,
    templateId: data.template_id,
    isFavorite: data.is_favorite || false,
    tags: data.tags || [],
    tradeData: data.trade_data,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at)
  };
}

function formatFolder(data: any): IFolder {
  return {
    id: data.id,
    userId: data.user_id,
    name: data.name,
    color: data.color,
    icon: data.icon,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at)
  };
}

function formatTemplate(data: any): ITemplate {
  return {
    id: data.id,
    userId: data.user_id,
    title: data.title,
    content: data.content,
    isDefault: data.is_default || false,
    isFavorite: data.is_favorite || false,
    category: data.category || 'custom',
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at)
  };
}
