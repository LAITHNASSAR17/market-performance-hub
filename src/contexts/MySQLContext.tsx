
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { MySQLConfig, MySQLTable, MySQLQueryResult } from '../models/mysql.model';
import { MySQLController } from '../controllers/mysql.controller';

// Extended interface to include notebook related operations
interface MySQLContextType {
  config: MySQLConfig;
  connectionStatus: 'disconnected' | 'connected' | 'error';
  tables: MySQLTable[];
  isConfigured: boolean;
  setConfig: (config: MySQLConfig) => void;
  connect: () => Promise<boolean>;
  disconnect: () => void;
  executeQuery: (query: string) => Promise<MySQLQueryResult>;
  fetchTables: () => Promise<MySQLTable[]>;
  fetchTableStructure: (tableName: string) => Promise<any>;
  fetchTableData: (tableName: string, limit?: number) => Promise<any[]>;
  
  // Notebook specific methods
  createFolder: (name: string, color?: string, userId?: number) => Promise<any>;
  getFolders: (userId?: number) => Promise<any[]>;
  updateFolder: (id: number, data: any) => Promise<boolean>;
  deleteFolder: (id: number) => Promise<boolean>;
  
  createNote: (noteData: any) => Promise<any>;
  getNotes: (folderId?: number, userId?: number) => Promise<any[]>;
  getNoteById: (id: number) => Promise<any>;
  updateNote: (id: number, data: any) => Promise<boolean>;
  deleteNote: (id: number) => Promise<boolean>;
  
  createTemplate: (templateData: any) => Promise<any>;
  getTemplates: (userId?: number) => Promise<any[]>;
  updateTemplate: (id: number, data: any) => Promise<boolean>;
  deleteTemplate: (id: number) => Promise<boolean>;
  
  getTags: (userId?: number) => Promise<any[]>;
  createTag: (name: string, userId?: number) => Promise<any>;
  deleteTag: (id: number) => Promise<boolean>;
  
  addTagToNote: (noteId: number, tagId: number) => Promise<boolean>;
  removeTagFromNote: (noteId: number, tagId: number) => Promise<boolean>;
  getNotesByTag: (tagId: number) => Promise<any[]>;
}

const MySQLContext = createContext<MySQLContextType | undefined>(undefined);

export const MySQLProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<MySQLConfig>(MySQLController.getConfig());
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connected' | 'error'>(
    MySQLController.getConnectionStatus()
  );
  const [tables, setTables] = useState<MySQLTable[]>(MySQLController.getTables());
  const { toast } = useToast();

  const isConfigured = Boolean(
    config.host && config.port && config.username && config.database
  );

  // Update the controller when config changes
  useEffect(() => {
    MySQLController.updateConfig(config);
  }, [config]);

  const connect = async (): Promise<boolean> => {
    if (!isConfigured) {
      toast({
        title: "Missing Configuration",
        description: "Please provide all required MySQL connection details",
        variant: "destructive"
      });
      return false;
    }

    toast({
      title: "Connecting...",
      description: `Attempting to connect to MySQL database ${config.database}`
    });

    try {
      const connected = await MySQLController.connect(config);
      
      if (connected) {
        const tables = await MySQLController.fetchTables();
        setTables(tables);
        setConnectionStatus('connected');
        
        toast({
          title: "Connection Successful",
          description: `Connected to ${config.database} on ${config.host}`
        });
      } else {
        throw new Error("Connection failed");
      }
      
      return connected;
    } catch (error) {
      setConnectionStatus('error');
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Could not connect to database",
        variant: "destructive"
      });
      return false;
    }
  };

  const disconnect = () => {
    MySQLController.disconnect();
    setConnectionStatus('disconnected');
    toast({
      title: "Disconnected",
      description: "Database connection closed"
    });
  };

  const executeQuery = async (query: string): Promise<MySQLQueryResult> => {
    if (connectionStatus !== 'connected') {
      toast({
        title: "Not Connected",
        description: "Please connect to the database first",
        variant: "destructive"
      });
      throw new Error("Database not connected");
    }

    toast({
      title: "Executing Query",
      description: "Processing SQL query..."
    });

    try {
      const result = await MySQLController.executeQuery(query);
      
      if (result.success) {
        let message = "Query executed successfully";
        if (result.affectedRows) {
          message = `Query affected ${result.affectedRows} row(s)`;
        } else if (result.data && Array.isArray(result.data)) {
          message = `Query returned ${result.data.length} result(s)`;
        }
        
        toast({
          title: "Query Executed",
          description: message
        });
      } else {
        throw new Error(result.error);
      }
      
      return result;
    } catch (error) {
      toast({
        title: "Query Failed",
        description: error instanceof Error ? error.message : "Failed to execute query",
        variant: "destructive"
      });
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
  };

  const fetchTables = async (): Promise<MySQLTable[]> => {
    try {
      const fetchedTables = await MySQLController.fetchTables();
      setTables(fetchedTables);
      return fetchedTables;
    } catch (error) {
      console.error("Failed to fetch tables:", error);
      throw error;
    }
  };

  const fetchTableStructure = async (tableName: string) => {
    return MySQLController.fetchTableStructure(tableName);
  };

  const fetchTableData = async (tableName: string, limit = 100) => {
    return MySQLController.fetchTableData(tableName, limit);
  };

  // Notebook specific methods
  const createFolder = async (name: string, color?: string, userId?: number) => {
    try {
      const actualUserId = userId || 1; // Default to user 1 if not provided
      const query = `INSERT INTO note_folders (name, color, userId, createdAt) 
                    VALUES (?, ?, ?, NOW())`;
      
      const result = await executeQuery(query);
      if (result.success && result.insertId) {
        toast({
          title: "Folder Created",
          description: `Folder "${name}" has been created`
        });
        return { id: result.insertId, name, color, userId: actualUserId };
      } else {
        throw new Error("Failed to create folder");
      }
    } catch (error) {
      toast({
        title: "Error Creating Folder",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
      throw error;
    }
  };

  const getFolders = async (userId?: number) => {
    try {
      const actualUserId = userId || 1; // Default to user 1 if not provided
      const query = `SELECT * FROM note_folders WHERE userId = ? ORDER BY name ASC`;
      
      const result = await executeQuery(query);
      return result.success && result.data ? result.data : [];
    } catch (error) {
      console.error("Failed to fetch folders:", error);
      return [];
    }
  };

  const updateFolder = async (id: number, data: any) => {
    try {
      // Build dynamic update query based on provided data
      const fields = Object.keys(data)
        .filter(key => key !== 'id')
        .map(key => `${key} = ?`).join(', ');
      
      const values = Object.keys(data)
        .filter(key => key !== 'id')
        .map(key => data[key]);
      
      values.push(id); // Add folder ID to values array

      const query = `UPDATE note_folders SET ${fields} WHERE id = ?`;
      
      const result = await executeQuery(query);
      if (result.success) {
        toast({
          title: "Folder Updated",
          description: `Folder has been updated successfully`
        });
        return true;
      } else {
        throw new Error("Failed to update folder");
      }
    } catch (error) {
      toast({
        title: "Error Updating Folder",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
      return false;
    }
  };

  const deleteFolder = async (id: number) => {
    try {
      // First check if folder has notes
      const checkQuery = `SELECT COUNT(*) as count FROM notes WHERE folderId = ?`;
      const checkResult = await executeQuery(checkQuery);
      
      if (checkResult.success && checkResult.data && checkResult.data[0].count > 0) {
        toast({
          title: "Cannot Delete Folder",
          description: "This folder contains notes. Delete or move the notes first.",
          variant: "destructive"
        });
        return false;
      }
      
      // If no notes, proceed with deletion
      const query = `DELETE FROM note_folders WHERE id = ?`;
      const result = await executeQuery(query);
      
      if (result.success) {
        toast({
          title: "Folder Deleted",
          description: "Folder has been deleted successfully"
        });
        return true;
      } else {
        throw new Error("Failed to delete folder");
      }
    } catch (error) {
      toast({
        title: "Error Deleting Folder",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
      return false;
    }
  };

  const createNote = async (noteData: any) => {
    try {
      const { title, content, folderId, userId = 1, tradeId = null } = noteData;
      
      const query = `INSERT INTO notes (title, content, folderId, userId, tradeId, createdAt, updatedAt) 
                    VALUES (?, ?, ?, ?, ?, NOW(), NOW())`;
      
      const result = await executeQuery(query);
      
      if (result.success && result.insertId) {
        // If tags were provided, add them
        if (noteData.tags && Array.isArray(noteData.tags) && noteData.tags.length > 0) {
          for (const tagName of noteData.tags) {
            // First check if tag exists
            const tagCheckQuery = `SELECT id FROM tags WHERE name = ? AND userId = ?`;
            const tagResult = await executeQuery(tagCheckQuery);
            
            let tagId;
            
            if (tagResult.success && tagResult.data && tagResult.data.length > 0) {
              // Tag exists, use its ID
              tagId = tagResult.data[0].id;
            } else {
              // Tag doesn't exist, create it
              const tagCreateQuery = `INSERT INTO tags (name, userId, createdAt) VALUES (?, ?, NOW())`;
              const createResult = await executeQuery(tagCreateQuery);
              
              if (createResult.success && createResult.insertId) {
                tagId = createResult.insertId;
              }
            }
            
            // If we have a tag ID, link it to the note
            if (tagId) {
              const linkQuery = `INSERT INTO note_tags (noteId, tagId) VALUES (?, ?)`;
              await executeQuery(linkQuery);
            }
          }
        }
        
        toast({
          title: "Note Created",
          description: `Note "${title}" has been created`
        });
        
        return { 
          id: result.insertId, 
          title, 
          content, 
          folderId, 
          userId,
          tradeId,
          tags: noteData.tags || []
        };
      } else {
        throw new Error("Failed to create note");
      }
    } catch (error) {
      toast({
        title: "Error Creating Note",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
      throw error;
    }
  };

  const getNotes = async (folderId?: number, userId?: number) => {
    try {
      const actualUserId = userId || 1; // Default to user 1 if not provided
      
      let query = `SELECT n.*, GROUP_CONCAT(t.name) as tagList 
                   FROM notes n 
                   LEFT JOIN note_tags nt ON n.id = nt.noteId 
                   LEFT JOIN tags t ON nt.tagId = t.id 
                   WHERE n.userId = ?`;
      
      const params = [actualUserId];
      
      if (folderId) {
        query += ` AND n.folderId = ?`;
        params.push(folderId);
      }
      
      query += ` GROUP BY n.id ORDER BY n.updatedAt DESC`;
      
      const result = await executeQuery(query);
      
      if (result.success && result.data) {
        // Process the data to convert tagList string to array
        return result.data.map((note: any) => ({
          ...note,
          tags: note.tagList ? note.tagList.split(',') : []
        }));
      }
      
      return [];
    } catch (error) {
      console.error("Failed to fetch notes:", error);
      return [];
    }
  };

  const getNoteById = async (id: number) => {
    try {
      const query = `SELECT n.*, GROUP_CONCAT(t.name) as tagList 
                    FROM notes n 
                    LEFT JOIN note_tags nt ON n.id = nt.noteId 
                    LEFT JOIN tags t ON nt.tagId = t.id 
                    WHERE n.id = ? 
                    GROUP BY n.id`;
      
      const result = await executeQuery(query);
      
      if (result.success && result.data && result.data.length > 0) {
        const note = result.data[0];
        return {
          ...note,
          tags: note.tagList ? note.tagList.split(',') : []
        };
      }
      
      return null;
    } catch (error) {
      console.error(`Failed to fetch note with ID ${id}:`, error);
      return null;
    }
  };

  const updateNote = async (id: number, data: any) => {
    try {
      // Build dynamic update query based on provided data
      const fields = Object.keys(data)
        .filter(key => key !== 'id' && key !== 'tags')
        .map(key => `${key} = ?`).join(', ');
      
      const values = Object.keys(data)
        .filter(key => key !== 'id' && key !== 'tags')
        .map(key => data[key]);
      
      // Always update the updatedAt timestamp
      const query = `UPDATE notes SET ${fields}, updatedAt = NOW() WHERE id = ?`;
      
      values.push(id); // Add note ID to values array
      
      const result = await executeQuery(query);
      
      // If tags were provided, update them
      if (data.tags && Array.isArray(data.tags)) {
        // First remove all existing tag associations
        const removeQuery = `DELETE FROM note_tags WHERE noteId = ?`;
        await executeQuery(removeQuery);
        
        // Then add new tag associations
        for (const tagName of data.tags) {
          // Check if tag exists
          const tagCheckQuery = `SELECT id FROM tags WHERE name = ? AND userId = (SELECT userId FROM notes WHERE id = ?)`;
          const tagResult = await executeQuery(tagCheckQuery);
          
          let tagId;
          
          if (tagResult.success && tagResult.data && tagResult.data.length > 0) {
            // Tag exists, use its ID
            tagId = tagResult.data[0].id;
          } else {
            // Tag doesn't exist, create it
            const userId = (await getNoteById(id))?.userId || 1;
            const tagCreateQuery = `INSERT INTO tags (name, userId, createdAt) VALUES (?, ?, NOW())`;
            const createResult = await executeQuery(tagCreateQuery);
            
            if (createResult.success && createResult.insertId) {
              tagId = createResult.insertId;
            }
          }
          
          // If we have a tag ID, link it to the note
          if (tagId) {
            const linkQuery = `INSERT INTO note_tags (noteId, tagId) VALUES (?, ?)`;
            await executeQuery(linkQuery);
          }
        }
      }
      
      if (result.success) {
        toast({
          title: "Note Updated",
          description: `Note has been updated successfully`
        });
        return true;
      } else {
        throw new Error("Failed to update note");
      }
    } catch (error) {
      toast({
        title: "Error Updating Note",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
      return false;
    }
  };

  const deleteNote = async (id: number) => {
    try {
      // First remove all tag associations
      const removeTagsQuery = `DELETE FROM note_tags WHERE noteId = ?`;
      await executeQuery(removeTagsQuery);
      
      // Then delete the note
      const query = `DELETE FROM notes WHERE id = ?`;
      const result = await executeQuery(query);
      
      if (result.success) {
        toast({
          title: "Note Deleted",
          description: "Note has been deleted successfully"
        });
        return true;
      } else {
        throw new Error("Failed to delete note");
      }
    } catch (error) {
      toast({
        title: "Error Deleting Note",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
      return false;
    }
  };

  const createTemplate = async (templateData: any) => {
    try {
      const { title, content, type = 'custom', userId = 1, emoji } = templateData;
      
      const query = `INSERT INTO note_templates (title, content, type, userId, emoji, createdAt) 
                    VALUES (?, ?, ?, ?, ?, NOW())`;
      
      const result = await executeQuery(query);
      
      if (result.success && result.insertId) {
        toast({
          title: "Template Created",
          description: `Template "${title}" has been created`
        });
        
        return { 
          id: result.insertId, 
          title, 
          content, 
          type,
          userId,
          emoji
        };
      } else {
        throw new Error("Failed to create template");
      }
    } catch (error) {
      toast({
        title: "Error Creating Template",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
      throw error;
    }
  };

  const getTemplates = async (userId?: number) => {
    try {
      const actualUserId = userId || 1; // Default to user 1 if not provided
      
      // Fetch both user templates and system templates (where userId is null)
      const query = `SELECT * FROM note_templates 
                     WHERE userId = ? OR userId IS NULL 
                     ORDER BY type, title`;
      
      const result = await executeQuery(query);
      
      return result.success && result.data ? result.data : [];
    } catch (error) {
      console.error("Failed to fetch templates:", error);
      return [];
    }
  };

  const updateTemplate = async (id: number, data: any) => {
    try {
      // Build dynamic update query based on provided data
      const fields = Object.keys(data)
        .filter(key => key !== 'id')
        .map(key => `${key} = ?`).join(', ');
      
      const values = Object.keys(data)
        .filter(key => key !== 'id')
        .map(key => data[key]);
      
      values.push(id); // Add template ID to values array
      
      const query = `UPDATE note_templates SET ${fields} WHERE id = ?`;
      
      const result = await executeQuery(query);
      
      if (result.success) {
        toast({
          title: "Template Updated",
          description: `Template has been updated successfully`
        });
        return true;
      } else {
        throw new Error("Failed to update template");
      }
    } catch (error) {
      toast({
        title: "Error Updating Template",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
      return false;
    }
  };

  const deleteTemplate = async (id: number) => {
    try {
      const query = `DELETE FROM note_templates WHERE id = ?`;
      const result = await executeQuery(query);
      
      if (result.success) {
        toast({
          title: "Template Deleted",
          description: "Template has been deleted successfully"
        });
        return true;
      } else {
        throw new Error("Failed to delete template");
      }
    } catch (error) {
      toast({
        title: "Error Deleting Template",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
      return false;
    }
  };

  const getTags = async (userId?: number) => {
    try {
      const actualUserId = userId || 1; // Default to user 1 if not provided
      
      // Fetch both user tags and system tags (where userId is null)
      const query = `SELECT t.*, COUNT(nt.noteId) as noteCount 
                     FROM tags t 
                     LEFT JOIN note_tags nt ON t.id = nt.tagId 
                     WHERE t.userId = ? OR t.userId IS NULL 
                     GROUP BY t.id 
                     ORDER BY t.name`;
      
      const result = await executeQuery(query);
      
      return result.success && result.data ? result.data : [];
    } catch (error) {
      console.error("Failed to fetch tags:", error);
      return [];
    }
  };

  const createTag = async (name: string, userId?: number) => {
    try {
      const actualUserId = userId || 1; // Default to user 1 if not provided
      
      // Check if tag already exists
      const checkQuery = `SELECT id FROM tags WHERE name = ? AND (userId = ? OR userId IS NULL)`;
      const checkResult = await executeQuery(checkQuery);
      
      if (checkResult.success && checkResult.data && checkResult.data.length > 0) {
        return checkResult.data[0]; // Return existing tag
      }
      
      // Create new tag
      const query = `INSERT INTO tags (name, userId, createdAt) VALUES (?, ?, NOW())`;
      const result = await executeQuery(query);
      
      if (result.success && result.insertId) {
        return { id: result.insertId, name, userId: actualUserId };
      } else {
        throw new Error("Failed to create tag");
      }
    } catch (error) {
      console.error("Failed to create tag:", error);
      throw error;
    }
  };

  const deleteTag = async (id: number) => {
    try {
      // First remove all note associations
      const removeAssociationsQuery = `DELETE FROM note_tags WHERE tagId = ?`;
      await executeQuery(removeAssociationsQuery);
      
      // Then delete the tag
      const query = `DELETE FROM tags WHERE id = ?`;
      const result = await executeQuery(query);
      
      if (result.success) {
        toast({
          title: "Tag Deleted",
          description: "Tag has been deleted successfully"
        });
        return true;
      } else {
        throw new Error("Failed to delete tag");
      }
    } catch (error) {
      toast({
        title: "Error Deleting Tag",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
      return false;
    }
  };

  const addTagToNote = async (noteId: number, tagId: number) => {
    try {
      // Check if association already exists
      const checkQuery = `SELECT * FROM note_tags WHERE noteId = ? AND tagId = ?`;
      const checkResult = await executeQuery(checkQuery);
      
      if (checkResult.success && checkResult.data && checkResult.data.length > 0) {
        return true; // Association already exists
      }
      
      // Create new association
      const query = `INSERT INTO note_tags (noteId, tagId) VALUES (?, ?)`;
      const result = await executeQuery(query);
      
      return result.success;
    } catch (error) {
      console.error("Failed to add tag to note:", error);
      return false;
    }
  };

  const removeTagFromNote = async (noteId: number, tagId: number) => {
    try {
      const query = `DELETE FROM note_tags WHERE noteId = ? AND tagId = ?`;
      const result = await executeQuery(query);
      
      return result.success;
    } catch (error) {
      console.error("Failed to remove tag from note:", error);
      return false;
    }
  };

  const getNotesByTag = async (tagId: number) => {
    try {
      const query = `SELECT n.*, GROUP_CONCAT(t.name) as tagList 
                     FROM notes n 
                     JOIN note_tags nt ON n.id = nt.noteId 
                     LEFT JOIN note_tags nt2 ON n.id = nt2.noteId 
                     LEFT JOIN tags t ON nt2.tagId = t.id 
                     WHERE nt.tagId = ? 
                     GROUP BY n.id 
                     ORDER BY n.updatedAt DESC`;
      
      const result = await executeQuery(query);
      
      if (result.success && result.data) {
        // Process the data to convert tagList string to array
        return result.data.map((note: any) => ({
          ...note,
          tags: note.tagList ? note.tagList.split(',') : []
        }));
      }
      
      return [];
    } catch (error) {
      console.error("Failed to fetch notes by tag:", error);
      return [];
    }
  };

  // Update state when connection status changes
  useEffect(() => {
    setConnectionStatus(MySQLController.getConnectionStatus());
  }, []);

  return (
    <MySQLContext.Provider
      value={{
        config,
        connectionStatus,
        tables,
        isConfigured,
        setConfig,
        connect,
        disconnect,
        executeQuery,
        fetchTables,
        fetchTableStructure,
        fetchTableData,
        
        // Notebook specific methods
        createFolder,
        getFolders,
        updateFolder,
        deleteFolder,
        
        createNote,
        getNotes,
        getNoteById,
        updateNote,
        deleteNote,
        
        createTemplate,
        getTemplates,
        updateTemplate,
        deleteTemplate,
        
        getTags,
        createTag,
        deleteTag,
        
        addTagToNote,
        removeTagFromNote,
        getNotesByTag
      }}
    >
      {children}
    </MySQLContext.Provider>
  );
};

export const useMySQL = () => {
  const context = useContext(MySQLContext);
  if (context === undefined) {
    throw new Error('useMySQL must be used within a MySQLProvider');
  }
  return context;
};
