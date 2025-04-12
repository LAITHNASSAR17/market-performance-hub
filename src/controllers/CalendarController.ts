
import { CalendarModel, CalendarEvent } from '../models/CalendarModel';

export class CalendarController {
  private model: CalendarModel;

  constructor() {
    this.model = new CalendarModel();
  }

  async getUserEvents(userId: string, startDate?: Date, endDate?: Date): Promise<CalendarEvent[]> {
    try {
      return await this.model.getUserEvents(userId, startDate, endDate);
    } catch (error) {
      console.error('Error getting user events:', error);
      return [];
    }
  }

  async getEventById(id: string, userId: string): Promise<CalendarEvent | null> {
    try {
      return await this.model.getEventById(id, userId);
    } catch (error) {
      console.error('Error getting event by ID:', error);
      return null;
    }
  }

  async createEvent(eventData: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>): Promise<string | null> {
    try {
      // Validate event data
      this.validateEventData(eventData);
      
      // Ensure end date is after start date
      if (eventData.endDate && new Date(eventData.endDate) < new Date(eventData.startDate)) {
        throw new Error('End date must be after start date');
      }
      
      return await this.model.createEvent(eventData);
    } catch (error) {
      console.error('Error creating event:', error);
      return null;
    }
  }

  async updateEvent(id: string, userId: string, eventData: Partial<CalendarEvent>): Promise<boolean> {
    try {
      // Check if event exists first
      const existingEvent = await this.model.getEventById(id, userId);
      if (!existingEvent) {
        throw new Error('Event not found');
      }
      
      // Partial validation of the updated fields
      if (Object.keys(eventData).length > 0) {
        this.validatePartialEventData(eventData);
      }
      
      // Ensure end date is after start date if both are provided
      if (eventData.startDate && eventData.endDate) {
        if (new Date(eventData.endDate) < new Date(eventData.startDate)) {
          throw new Error('End date must be after start date');
        }
      } else if (eventData.startDate && existingEvent.endDate) {
        // If only start date is updated, check against existing end date
        if (new Date(eventData.startDate) > new Date(existingEvent.endDate)) {
          throw new Error('Start date must be before existing end date');
        }
      } else if (eventData.endDate && existingEvent.startDate) {
        // If only end date is updated, check against existing start date
        if (new Date(eventData.endDate) < new Date(existingEvent.startDate)) {
          throw new Error('End date must be after existing start date');
        }
      }
      
      return await this.model.updateEvent(id, userId, eventData);
    } catch (error) {
      console.error('Error updating event:', error);
      return false;
    }
  }

  async deleteEvent(id: string, userId: string): Promise<boolean> {
    try {
      // Check if event exists first
      const existingEvent = await this.model.getEventById(id, userId);
      if (!existingEvent) {
        throw new Error('Event not found');
      }
      
      return await this.model.deleteEvent(id, userId);
    } catch (error) {
      console.error('Error deleting event:', error);
      return false;
    }
  }

  async getEventsByType(userId: string, eventType: string): Promise<CalendarEvent[]> {
    try {
      return await this.model.getEventsByType(userId, eventType);
    } catch (error) {
      console.error('Error getting events by type:', error);
      return [];
    }
  }

  async getEventsForDate(userId: string, date: Date): Promise<CalendarEvent[]> {
    try {
      return await this.model.getEventsForDate(userId, date);
    } catch (error) {
      console.error('Error getting events for date:', error);
      return [];
    }
  }

  async getRelatedEvents(userId: string, relatedEntityId: string): Promise<CalendarEvent[]> {
    try {
      return await this.model.getRelatedEvents(userId, relatedEntityId);
    } catch (error) {
      console.error('Error getting related events:', error);
      return [];
    }
  }

  // Helper function to validate event data
  private validateEventData(eventData: Partial<CalendarEvent>): void {
    if (!eventData.userId) {
      throw new Error('User ID is required');
    }
    
    if (!eventData.title || eventData.title.trim() === '') {
      throw new Error('Event title is required');
    }
    
    if (!eventData.startDate) {
      throw new Error('Start date is required');
    }
    
    if (eventData.eventType && !['trade', 'note', 'reminder', 'custom'].includes(eventData.eventType)) {
      throw new Error('Invalid event type');
    }
    
    // If event is not all day, end date is required
    if (eventData.allDay === false && !eventData.endDate) {
      throw new Error('End date is required for non-all-day events');
    }
  }

  // Helper function to validate partial event data for updates
  private validatePartialEventData(eventData: Partial<CalendarEvent>): void {
    if (eventData.title !== undefined && eventData.title.trim() === '') {
      throw new Error('Event title cannot be empty');
    }
    
    if (eventData.eventType && !['trade', 'note', 'reminder', 'custom'].includes(eventData.eventType)) {
      throw new Error('Invalid event type');
    }
  }
}
