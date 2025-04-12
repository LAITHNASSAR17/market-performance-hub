
import { BaseModel } from './BaseModel';

export interface Tag {
  id: number;
  name: string;
  userId: number | null; // null for system tags
  count: number;
  category: 'mistake' | 'setup' | 'habit' | 'general';
  createdAt: Date;
  lastUsed: Date | null;
}

export interface TradeTag {
  id: number;
  tradeId: number;
  tagId: number;
  createdAt: Date;
}

export class TagModel extends BaseModel {
  constructor() {
    super('tags');
  }

  async findById(id: number): Promise<Tag | null> {
    if (!this.validateNumber(id)) {
      throw new Error('Invalid tag ID');
    }

    return super.findById(id);
  }

  async findByName(name: string, userId: number | null = null): Promise<Tag | null> {
    if (!this.validateString(name)) {
      throw new Error('Invalid tag name');
    }

    let sql = 'SELECT * FROM tags WHERE name = ?';
    const params = [name];
    
    if (userId !== null) {
      sql += ' AND (userId = ? OR userId IS NULL)';
      params.push(userId);
    }
    
    sql += ' LIMIT 1';
    const result = await this.query(sql, params);
    return result[0] || null;
  }

  async create(tagData: Omit<Tag, 'id' | 'createdAt' | 'count' | 'lastUsed'>): Promise<number> {
    if (!this.validateString(tagData.name)) {
      throw new Error('Invalid tag name');
    }

    // Sanitize data
    const sanitizedName = this.sanitizeString(tagData.name);
    
    // Check if tag already exists
    const existingTag = await this.findByName(sanitizedName, tagData.userId);
    if (existingTag) {
      return existingTag.id;
    }

    // Add current timestamp and initialize count
    const dataToInsert = {
      name: sanitizedName,
      userId: tagData.userId,
      category: tagData.category || 'general',
      count: 0,
      createdAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
      lastUsed: null
    };

    const sql = 'INSERT INTO tags (name, userId, category, count, createdAt, lastUsed) VALUES (?, ?, ?, ?, ?, ?)';
    const result = await this.query(sql, [
      dataToInsert.name,
      dataToInsert.userId,
      dataToInsert.category,
      dataToInsert.count,
      dataToInsert.createdAt,
      dataToInsert.lastUsed
    ]);

    return result.insertId;
  }

  async update(id: number, tagData: Partial<Tag>): Promise<boolean> {
    if (!this.validateNumber(id)) {
      throw new Error('Invalid tag ID');
    }

    // Validate name if provided
    if (tagData.name && !this.validateString(tagData.name)) {
      throw new Error('Invalid tag name');
    }

    // Sanitize data
    if (tagData.name) {
      tagData.name = this.sanitizeString(tagData.name);
    }

    // Build SQL for update
    const updateFields: string[] = [];
    const values: any[] = [];

    Object.entries(tagData).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'createdAt') {
        updateFields.push(`${key} = ?`);
        values.push(value);
      }
    });

    if (updateFields.length === 0) {
      return true; // Nothing to update
    }

    values.push(id); // Add ID for WHERE clause
    const sql = `UPDATE tags SET ${updateFields.join(', ')} WHERE id = ?`;
    const result = await this.query(sql, values);

    return result.affectedRows > 0;
  }

  async delete(id: number): Promise<boolean> {
    if (!this.validateNumber(id)) {
      throw new Error('Invalid tag ID');
    }

    // Also delete all trade-tag associations
    await this.query('DELETE FROM trade_tags WHERE tagId = ?', [id]);

    return super.delete(id);
  }

  async incrementCount(id: number): Promise<boolean> {
    if (!this.validateNumber(id)) {
      throw new Error('Invalid tag ID');
    }

    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const sql = 'UPDATE tags SET count = count + 1, lastUsed = ? WHERE id = ?';
    const result = await this.query(sql, [now, id]);

    return result.affectedRows > 0;
  }

  async getUserTags(userId: number, category?: string): Promise<Tag[]> {
    if (!this.validateNumber(userId)) {
      throw new Error('Invalid user ID');
    }

    let sql = 'SELECT * FROM tags WHERE userId = ? OR userId IS NULL';
    const params = [userId];
    
    if (category) {
      sql += ' AND category = ?';
      params.push(category);
    }
    
    sql += ' ORDER BY count DESC, name ASC';
    return this.query(sql, params);
  }

  async getSystemTags(): Promise<Tag[]> {
    const sql = 'SELECT * FROM tags WHERE userId IS NULL ORDER BY count DESC, name ASC';
    return this.query(sql);
  }

  async getPopularTags(limit = 10): Promise<Tag[]> {
    const sql = 'SELECT * FROM tags ORDER BY count DESC LIMIT ?';
    return this.query(sql, [limit]);
  }

  // Methods for trade-tag associations
  async addTagToTrade(tradeId: number, tagId: number): Promise<number> {
    if (!this.validateNumber(tradeId) || !this.validateNumber(tagId)) {
      throw new Error('Invalid trade ID or tag ID');
    }

    // Check if the association already exists
    const existingSql = 'SELECT id FROM trade_tags WHERE tradeId = ? AND tagId = ?';
    const existingResult = await this.query(existingSql, [tradeId, tagId]);
    
    if (existingResult.length > 0) {
      return existingResult[0].id;
    }

    const createdAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const sql = 'INSERT INTO trade_tags (tradeId, tagId, createdAt) VALUES (?, ?, ?)';
    const result = await this.query(sql, [tradeId, tagId, createdAt]);

    // Increment the tag count
    await this.incrementCount(tagId);

    return result.insertId;
  }

  async removeTagFromTrade(tradeId: number, tagId: number): Promise<boolean> {
    if (!this.validateNumber(tradeId) || !this.validateNumber(tagId)) {
      throw new Error('Invalid trade ID or tag ID');
    }

    const sql = 'DELETE FROM trade_tags WHERE tradeId = ? AND tagId = ?';
    const result = await this.query(sql, [tradeId, tagId]);

    return result.affectedRows > 0;
  }

  async getTradeTagIds(tradeId: number): Promise<number[]> {
    if (!this.validateNumber(tradeId)) {
      throw new Error('Invalid trade ID');
    }

    const sql = 'SELECT tagId FROM trade_tags WHERE tradeId = ?';
    const results = await this.query(sql, [tradeId]);
    
    return results.map((row: any) => row.tagId);
  }

  async getTradeTags(tradeId: number): Promise<Tag[]> {
    if (!this.validateNumber(tradeId)) {
      throw new Error('Invalid trade ID');
    }

    const sql = `
      SELECT t.* 
      FROM tags t
      JOIN trade_tags tt ON t.id = tt.tagId
      WHERE tt.tradeId = ?
      ORDER BY t.name ASC
    `;
    
    return this.query(sql, [tradeId]);
  }

  async getTradesByTag(tagId: number): Promise<number[]> {
    if (!this.validateNumber(tagId)) {
      throw new Error('Invalid tag ID');
    }

    const sql = 'SELECT tradeId FROM trade_tags WHERE tagId = ?';
    const results = await this.query(sql, [tagId]);
    
    return results.map((row: any) => row.tradeId);
  }
}
