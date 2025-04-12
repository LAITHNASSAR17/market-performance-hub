
import { CalendarModel, CalendarEvent } from '../models/CalendarModel';

export class CalendarController {
  private model: CalendarModel;

  constructor() {
    this.model = new CalendarModel();
  }

  // Get all calendar events for a user
  async getUserEvents(userId: number, startDate?: Date, endDate?: Date): Promise<CalendarEvent[]> {
    try {
      return await this.model.getUserEvents(userId, startDate, endDate);
    } catch (error) {
      console.error('Error getting user events:', error);
      return [];
    }
  }

  // Get event by ID
  async getEventById(id: number, userId: number): Promise<CalendarEvent | null> {
    try {
      return await this.model.getEventById(id, userId);
    } catch (error) {
      console.error('Error getting event by ID:', error);
      return null;
    }
  }

  // Create a new calendar event
  async createEvent(event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>): Promise<number | null> {
    try {
      // Validate event data
      this.validateEventData(event);
      
      return await this.model.createEvent(event);
    } catch (error) {
      console.error('Error creating event:', error);
      return null;
    }
  }

  // Update a calendar event
  async updateEvent(id: number, userId: number, eventData: Partial<CalendarEvent>): Promise<boolean> {
    try {
      // Check if the event exists and belongs to the user
      const existingEvent = await this.model.getEventById(id, userId);
      if (!existingEvent) {
        throw new Error('Event not found or does not belong to this user');
      }
      
      // Validate event data
      if (Object.keys(eventData).length > 0) {
        this.validateEventData(eventData as any);
      }
      
      return await this.model.updateEvent(id, userId, eventData);
    } catch (error) {
      console.error('Error updating event:', error);
      return false;
    }
  }

  // Delete a calendar event
  async deleteEvent(id: number, userId: number): Promise<boolean> {
    try {
      // Check if the event exists and belongs to the user
      const existingEvent = await this.model.getEventById(id, userId);
      if (!existingEvent) {
        throw new Error('Event not found or does not belong to this user');
      }
      
      return await this.model.deleteEvent(id, userId);
    } catch (error) {
      console.error('Error deleting event:', error);
      return false;
    }
  }

  // Get events by type
  async getEventsByType(userId: number, eventType: string): Promise<CalendarEvent[]> {
    try {
      return await this.model.getEventsByType(userId, eventType);
    } catch (error) {
      console.error('Error getting events by type:', error);
      return [];
    }
  }

  // Get events for a specific date
  async getEventsForDate(userId: number, date: Date): Promise<CalendarEvent[]> {
    try {
      if (!(date instanceof Date) || isNaN(date.getTime())) {
        throw new Error('Invalid date');
      }
      
      return await this.model.getEventsForDate(userId, date);
    } catch (error) {
      console.error('Error getting events for date:', error);
      return [];
    }
  }

  // Get events related to a specific entity (e.g., trade)
  async getRelatedEvents(userId: number, relatedEntityId: number): Promise<CalendarEvent[]> {
    try {
      return await this.model.getRelatedEvents(userId, relatedEntityId);
    } catch (error) {
      console.error('Error getting related events:', error);
      return [];
    }
  }

  // Helper function to validate event data
  private validateEventData(event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>): void {
    if (!event.userId || typeof event.userId !== 'number') {
      throw new Error('Invalid or missing userId');
    }
    
    if (!event.title || typeof event.title !== 'string') {
      throw new Error('Invalid or missing title');
    }
    
    if (event.eventType && 
        !['trade', 'note', 'reminder', 'custom'].includes(event.eventType)) {
      throw new Error('Invalid event type');
    }
    
    // Validate dates
    if (event.startDate) {
      const startDate = new Date(event.startDate);
      if (isNaN(startDate.getTime())) {
        throw new Error('Invalid start date');
      }
      
      if (event.endDate) {
        const endDate = new Date(event.endDate);
        if (isNaN(endDate.getTime())) {
          throw new Error('Invalid end date');
        }
        
        if (startDate > endDate) {
          throw new Error('Start date must be before end date');
        }
      }
    }
    
    if ('allDay' in event && typeof event.allDay !== 'boolean') {
      throw new Error('All day flag must be a boolean');
    }
    
    if (event.color && typeof event.color !== 'string') {
      throw new Error('Color must be a string');
    }
  }
}
