
import { BaseModel } from './BaseModel';

export interface CalendarEvent {
  id: string;
  userId: string;
  title: string;
  description: string;
  eventType: 'trade' | 'note' | 'reminder' | 'custom';
  startDate: Date;
  endDate: Date;
  allDay: boolean;
  color: string;
  relatedEntityId?: string; // ID of related entity (trade, note, etc.)
  createdAt: Date;
  updatedAt: Date;
}

export class CalendarModel extends BaseModel {
  constructor() {
    super('calendar_events');
  }

  // Get all calendar events for a user
  async getUserEvents(userId: string, startDate?: Date, endDate?: Date): Promise<CalendarEvent[]> {
    let query: Record<string, any> = { userId };
    
    if (startDate) {
      query.startDate = { $gte: startDate };
    }
    
    if (endDate) {
      query.endDate = { $lte: endDate };
    }
    
    return this.findAll(query);
  }

  // Get event by ID
  async getEventById(id: string, userId: string): Promise<CalendarEvent | null> {
    const result = await this.findAll({ _id: id, userId });
    return result.length > 0 ? result[0] : null;
  }

  // Create a new calendar event
  async createEvent(event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    // Sanitize input
    const sanitizedEvent = this.sanitizeObject(event);
    
    // Add timestamps
    const now = new Date();
    const eventWithTimestamps = {
      ...sanitizedEvent,
      createdAt: now,
      updatedAt: now
    };
    
    return await this.create(eventWithTimestamps);
  }

  // Update a calendar event
  async updateEvent(id: string, userId: string, eventData: Partial<CalendarEvent>): Promise<boolean> {
    // Sanitize input
    const sanitizedEvent = this.sanitizeObject(eventData);
    
    // Add updated timestamp
    const dataWithTimestamp = {
      ...sanitizedEvent,
      updatedAt: new Date()
    };
    
    const result = await this.query("UPDATE calendar_events SET ? WHERE id = ? AND userId = ?", [dataWithTimestamp, id, userId]);
    return result.length > 0 && result[0]?.affectedRows > 0;
  }

  // Delete a calendar event
  async deleteEvent(id: string, userId: string): Promise<boolean> {
    const result = await this.query("DELETE FROM calendar_events WHERE id = ? AND userId = ?", [id, userId]);
    return result.length > 0 && result[0]?.affectedRows > 0;
  }

  // Get events by type
  async getEventsByType(userId: string, eventType: string): Promise<CalendarEvent[]> {
    return this.findAll({ userId, eventType });
  }

  // Get events for a specific date
  async getEventsForDate(userId: string, date: Date): Promise<CalendarEvent[]> {
    // Format date to YYYY-MM-DD for comparison
    const formattedDate = date.toISOString().split('T')[0];
    
    return this.findAll({
      userId,
      $or: [
        {
          startDate: { $lte: formattedDate },
          endDate: { $gte: formattedDate }
        },
        {
          allDay: true,
          startDate: formattedDate
        }
      ]
    });
  }

  // Get events related to a specific entity (e.g., trade)
  async getRelatedEvents(userId: string, relatedEntityId: string): Promise<CalendarEvent[]> {
    return this.findAll({ userId, relatedEntityId });
  }
}
