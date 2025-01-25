import { Context } from 'hono';
import { EventService } from '../services/EventService';

export class EventController {
  constructor(private eventService: EventService) {}

  async createEvent(c: Context) {
    try {
      const eventData = await c.req.json();
      const event = await this.eventService.createEvent(eventData);
      return c.json(event, 201);
    } catch (error) {
      return c.json({ 
        error: error instanceof Error ? error.message : 'Event creation failed' 
      }, 400);
    }
  }

  async getEvent(c: Context) {
    try {
      const eventId = c.req.param('id');
      const event = await this.eventService.getEvent(eventId);
      
      if (!event) {
        return c.json({ error: 'Event not found' }, 404);
      }
      
      return c.json(event);
    } catch (error) {
      return c.json({ 
        error: error instanceof Error ? error.message : 'Event retrieval failed' 
      }, 500);
    }
  }

  async getFamilyEvents(c: Context) {
    try {
      const familyId = c.req.param('familyId');
      const events = await this.eventService.getFamilyEvents(familyId);
      
      return c.json(events);
    } catch (error) {
      return c.json({ 
        error: error instanceof Error ? error.message : 'Family events retrieval failed' 
      }, 500);
    }
  }
}