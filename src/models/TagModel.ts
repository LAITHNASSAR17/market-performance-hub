
import { BaseModel } from './BaseModel';

export interface Tag {
  id: number;
  name: string;
  type: string;
  userId: number;
  createdAt: Date;
}

export class TagModel extends BaseModel {
  constructor() {
    super('tags');
  }

  // Get all tags for a user
  async getAllTags(userId: number): Promise<Tag[]> {
    const sql = "SELECT * FROM tags WHERE userId = ?";
    return this.query(sql, [userId]);
  }

  // Get all tags of a specific type for a user
  async getTagsByType(userId: number, type: string): Promise<Tag[]> {
    const sql = "SELECT * FROM tags WHERE userId = ? AND type = ?";
    return this.query(sql, [userId, type]);
  }

  // Get a tag by ID
  async getTagById(id: number): Promise<Tag | null> {
    const sql = "SELECT * FROM tags WHERE id = ?";
    const results = await this.query(sql, [id]);
    return results.length > 0 ? results[0] : null;
  }

  // Find a tag by name
  async findByName(name: string, userId: number | null = null): Promise<Tag | null> {
    let sql = "SELECT * FROM tags WHERE name = ?";
    const params: (string | number)[] = [name];
    
    if (userId !== null) {
      sql += " AND userId = ?";
      params.push(userId);
    }
    
    const results = await this.query(sql, params);
    return results.length > 0 ? results[0] : null;
  }

  // Create a new tag
  async createTag(tag: Omit<Tag, 'id' | 'createdAt'>): Promise<number> {
    // Sanitize input
    const sanitizedTag = this.sanitizeObject(tag);
    
    // Add createdAt date
    const tagWithDate = {
      ...sanitizedTag,
      createdAt: new Date()
    };
    
    return this.create(tagWithDate);
  }

  // Update a tag
  async updateTag(id: number, tagData: Partial<Tag>): Promise<boolean> {
    // Sanitize input
    const sanitizedTag = this.sanitizeObject(tagData);
    
    return this.update(id, sanitizedTag);
  }

  // Delete a tag
  async deleteTag(id: number): Promise<boolean> {
    return this.delete(id);
  }

  // Check if a tag exists by name for a user
  async tagExists(userId: number, name: string, type: string): Promise<boolean> {
    const sql = "SELECT COUNT(*) as count FROM tags WHERE userId = ? AND name = ? AND type = ?";
    const result = await this.query(sql, [userId, name, type]);
    return result[0].count > 0;
  }

  // Get tag usage statistics (how many times each tag is used)
  async getTagStats(userId: number): Promise<any[]> {
    const sql = `
      SELECT t.id, t.name, t.type, COUNT(tt.tradeId) as usageCount 
      FROM tags t 
      LEFT JOIN trade_tags tt ON t.id = tt.tagId 
      WHERE t.userId = ? 
      GROUP BY t.id, t.name, t.type
    `;
    return this.query(sql, [userId]);
  }

  // Get most used tags for a user
  async getMostUsedTags(userId: number, limit = 5): Promise<any[]> {
    const sql = `
      SELECT t.id, t.name, t.type, COUNT(tt.tradeId) as usageCount 
      FROM tags t 
      LEFT JOIN trade_tags tt ON t.id = tt.tagId 
      WHERE t.userId = ? 
      GROUP BY t.id, t.name, t.type
      ORDER BY usageCount DESC
      LIMIT ?
    `;
    return this.query(sql, [userId, limit]);
  }

  // Get system tags (tags without a user ID)
  async getSystemTags(): Promise<Tag[]> {
    const sql = "SELECT * FROM tags WHERE userId IS NULL";
    return this.query(sql, []);
  }

  // Get user tags
  async getUserTags(userId: number, category?: string): Promise<Tag[]> {
    let sql = "SELECT * FROM tags WHERE userId = ?";
    const params: any[] = [userId];
    
    if (category) {
      sql += " AND type = ?";
      params.push(category);
    }
    
    return this.query(sql, params);
  }

  // Get popular tags
  async getPopularTags(limit = 10): Promise<Tag[]> {
    const sql = `
      SELECT t.*, COUNT(tt.tradeId) as count
      FROM tags t
      LEFT JOIN trade_tags tt ON t.id = tt.tagId
      GROUP BY t.id
      ORDER BY count DESC
      LIMIT ?
    `;
    return this.query(sql, [limit]);
  }

  // Get tags for a specific trade
  async getTradeTags(tradeId: number): Promise<Tag[]> {
    const sql = `
      SELECT t.* 
      FROM tags t 
      JOIN trade_tags tt ON t.id = tt.tagId 
      WHERE tt.tradeId = ?
    `;
    return this.query(sql, [tradeId]);
  }

  // Associate tags with a trade
  async addTagsToTrade(tradeId: number, tagIds: number[]): Promise<boolean> {
    try {
      // First remove any existing tags for this trade
      await this.removeTagsFromTrade(tradeId);
      
      // Then add the new tags
      if (tagIds.length > 0) {
        const values = tagIds.map(tagId => [tradeId, tagId]);
        const placeholders = tagIds.map(() => "(?, ?)").join(", ");
        const sql = `INSERT INTO trade_tags (tradeId, tagId) VALUES ${placeholders}`;
        
        // Flatten the values array for the query
        const flatValues = values.flat();
        await this.query(sql, flatValues);
      }
      
      return true;
    } catch (error) {
      console.error("Error adding tags to trade:", error);
      return false;
    }
  }

  // Add a single tag to a trade
  async addTagToTrade(tradeId: number, tagId: number): Promise<boolean> {
    try {
      const sql = "INSERT INTO trade_tags (tradeId, tagId) VALUES (?, ?)";
      await this.query(sql, [tradeId, tagId]);
      return true;
    } catch (error) {
      console.error("Error adding tag to trade:", error);
      return false;
    }
  }

  // Remove all tag associations from a trade
  async removeTagsFromTrade(tradeId: number): Promise<boolean> {
    try {
      const sql = "DELETE FROM trade_tags WHERE tradeId = ?";
      await this.query(sql, [tradeId]);
      return true;
    } catch (error) {
      console.error("Error removing tags from trade:", error);
      return false;
    }
  }

  // Remove a specific tag from a trade
  async removeTagFromTrade(tradeId: number, tagId: number): Promise<boolean> {
    try {
      const sql = "DELETE FROM trade_tags WHERE tradeId = ? AND tagId = ?";
      await this.query(sql, [tradeId, tagId]);
      return true;
    } catch (error) {
      console.error("Error removing tag from trade:", error);
      return false;
    }
  }

  // Get all trades that have a specific tag
  async getTradesByTag(tagId: number): Promise<number[]> {
    const sql = `
      SELECT tradeId
      FROM trade_tags
      WHERE tagId = ?
    `;
    const results = await this.query(sql, [tagId]);
    return results.map((row: any) => row.tradeId);
  }
}
