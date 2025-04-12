
import { BaseModel } from './BaseModel';

export interface CalendarEvent {
  id: number;
  userId: number;
  title: string;
  description: string;
  eventType: 'trade' | 'note' | 'reminder' | 'custom';
  startDate: Date;
  endDate: Date;
  allDay: boolean;
  color: string;
  relatedEntityId?: number; // ID of related entity (trade, note, etc.)
  createdAt: Date;
  updatedAt: Date;
}

export class CalendarModel extends BaseModel {
  constructor() {
    super('calendar_events');
  }

  // Get all calendar events for a user
  async getUserEvents(userId: number, startDate?: Date, endDate?: Date): Promise<CalendarEvent[]> {
    let sql = "SELECT * FROM calendar_events WHERE userId = ?";
    const params: any[] = [userId];
    
    if (startDate) {
      sql += " AND startDate >= ?";
      params.push(startDate.toISOString());
    }
    
    if (endDate) {
      sql += " AND endDate <= ?";
      params.push(endDate.toISOString());
    }
    
    sql += " ORDER BY startDate ASC";
    
    return this.query(sql, params);
  }

  // Get event by ID
  async getEventById(id: number, userId: number): Promise<CalendarEvent | null> {
    const sql = "SELECT * FROM calendar_events WHERE id = ? AND userId = ?";
    const results = await this.query(sql, [id, userId]);
    return results.length > 0 ? results[0] : null;
  }

  // Create a new calendar event
  async createEvent(event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>): Promise<number> {
    // Sanitize input
    const sanitizedEvent = this.sanitizeObject(event);
    
    // Add timestamps
    const now = new Date();
    const eventWithTimestamps = {
      ...sanitizedEvent,
      createdAt: now,
      updatedAt: now
    };
    
    return this.create(eventWithTimestamps);
  }

  // Update a calendar event
  async updateEvent(id: number, userId: number, eventData: Partial<CalendarEvent>): Promise<boolean> {
    // Sanitize input
    const sanitizedEvent = this.sanitizeObject(eventData);
    
    // Add updated timestamp
    const dataWithTimestamp = {
      ...sanitizedEvent,
      updatedAt: new Date()
    };
    
    const sql = "UPDATE calendar_events SET ? WHERE id = ? AND userId = ?";
    const result = await this.query(sql, [dataWithTimestamp, id, userId]);
    return result.affectedRows > 0;
  }

  // Delete a calendar event
  async deleteEvent(id: number, userId: number): Promise<boolean> {
    const sql = "DELETE FROM calendar_events WHERE id = ? AND userId = ?";
    const result = await this.query(sql, [id, userId]);
    return result.affectedRows > 0;
  }

  // Get events by type
  async getEventsByType(userId: number, eventType: string): Promise<CalendarEvent[]> {
    const sql = "SELECT * FROM calendar_events WHERE userId = ? AND eventType = ? ORDER BY startDate ASC";
    return this.query(sql, [userId, eventType]);
  }

  // Get events for a specific date
  async getEventsForDate(userId: number, date: Date): Promise<CalendarEvent[]> {
    // Format date to YYYY-MM-DD for comparison
    const formattedDate = date.toISOString().split('T')[0];
    
    const sql = `
      SELECT * FROM calendar_events 
      WHERE userId = ? 
      AND (
        (DATE(startDate) <= ? AND DATE(endDate) >= ?) OR
        (allDay = 1 AND DATE(startDate) = ?)
      )
      ORDER BY startDate ASC
    `;
    
    return this.query(sql, [userId, formattedDate, formattedDate, formattedDate]);
  }

  // Get events related to a specific entity (e.g., trade)
  async getRelatedEvents(userId: number, relatedEntityId: number): Promise<CalendarEvent[]> {
    const sql = "SELECT * FROM calendar_events WHERE userId = ? AND relatedEntityId = ? ORDER BY startDate ASC";
    return this.query(sql, [userId, relatedEntityId]);
  }
}
