import { TagModel, Tag } from '../models/TagModel';

export class TagController {
  private model: TagModel;

  constructor() {
    this.model = new TagModel();
  }

  async getAllTags(): Promise<Tag[]> {
    try {
      // Using empty object as parameter to match the expected argument count
      return await this.model.getAllTags({});
    } catch (error) {
      console.error('Error getting all tags:', error);
      return [];
    }
  }

  async getTag(id: number): Promise<Tag | null> {
    try {
      return await this.model.getTagById(id);
    } catch (error) {
      console.error('Error getting tag:', error);
      return null;
    }
  }

  async getTagByName(name: string, userId: number | null = null): Promise<Tag | null> {
    try {
      return await this.model.findByName(name, userId);
    } catch (error) {
      console.error('Error getting tag by name:', error);
      return null;
    }
  }

  async createTag(tagData: Omit<Tag, 'id' | 'createdAt'>): Promise<number | null> {
    try {
      return await this.model.createTag(tagData);
    } catch (error) {
      console.error('Error creating tag:', error);
      return null;
    }
  }

  async updateTag(id: number, tagData: Partial<Tag>): Promise<boolean> {
    try {
      // Business logic - check if tag exists first
      const existingTag = await this.model.getTagById(id);
      if (!existingTag) {
        throw new Error('Tag not found');
      }

      // Additional business logic - system tags can only be updated by admins
      if (existingTag.userId === null && tagData.userId !== null) {
        throw new Error('Cannot change ownership of system tags');
      }

      return await this.model.updateTag(id, tagData);
    } catch (error) {
      console.error('Error updating tag:', error);
      return false;
    }
  }

  async deleteTag(id: number): Promise<boolean> {
    try {
      // Business logic - check if tag exists first
      const existingTag = await this.model.getTagById(id);
      if (!existingTag) {
        throw new Error('Tag not found');
      }

      return await this.model.deleteTag(id);
    } catch (error) {
      console.error('Error deleting tag:', error);
      return false;
    }
  }

  async getUserTags(userId: number, category?: string): Promise<Tag[]> {
    try {
      return await this.model.getUserTags(userId, category);
    } catch (error) {
      console.error('Error getting user tags:', error);
      return [];
    }
  }

  async getSystemTags(): Promise<Tag[]> {
    try {
      return await this.model.getSystemTags();
    } catch (error) {
      console.error('Error getting system tags:', error);
      return [];
    }
  }

  async getPopularTags(limit = 10): Promise<Tag[]> {
    try {
      return await this.model.getPopularTags(limit);
    } catch (error) {
      console.error('Error getting popular tags:', error);
      return [];
    }
  }

  async addTagToTrade(tradeId: number, tagName: string, userId: number, category: 'mistake' | 'setup' | 'habit' | 'general' = 'general'): Promise<boolean> {
    try {
      // First, check if the tag exists or create it
      let tag = await this.model.findByName(tagName, userId);
      
      if (!tag) {
        const tagId = await this.model.createTag({
          name: tagName,
          userId,
          type: category
        });
        
        if (!tagId) {
          throw new Error('Failed to create tag');
        }
        
        tag = await this.model.getTagById(tagId);
        
        if (!tag) {
          throw new Error('Failed to retrieve created tag');
        }
      }
      
      // Add the tag to the trade
      await this.model.addTagToTrade(tradeId, tag.id);
      return true;
    } catch (error) {
      console.error('Error adding tag to trade:', error);
      return false;
    }
  }

  async addTagsToTrade(tradeId: number, tagNames: string[], userId: number): Promise<boolean> {
    try {
      for (const tagName of tagNames) {
        await this.addTagToTrade(tradeId, tagName, userId);
      }
      return true;
    } catch (error) {
      console.error('Error adding tags to trade:', error);
      return false;
    }
  }

  async removeTagFromTrade(tradeId: number, tagId: number): Promise<boolean> {
    try {
      return await this.model.removeTagFromTrade(tradeId, tagId);
    } catch (error) {
      console.error('Error removing tag from trade:', error);
      return false;
    }
  }

  async getTradeTags(tradeId: number): Promise<Tag[]> {
    try {
      return await this.model.getTradeTags(tradeId);
    } catch (error) {
      console.error('Error getting trade tags:', error);
      return [];
    }
  }

  async getTradesByTag(tagId: number): Promise<number[]> {
    try {
      return await this.model.getTradesByTag(tagId);
    } catch (error) {
      console.error('Error getting trades by tag:', error);
      return [];
    }
  }

  // Helper function to format a string as a tag (lowercase, alphanumeric with hyphens)
  formatTagName(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters except hyphens
      .replace(/\s+/g, '-')     // Replace spaces with hyphens
      .replace(/-+/g, '-');     // Replace multiple hyphens with a single one
  }
}
