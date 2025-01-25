import { Context } from 'hono';
import { prisma } from '../../../core/lib/prisma';
import { AppError } from '../../../core/errors/AppError';
import { ValidationException } from '../../../core/validation/types';

export class EventController {
  static async create(c: Context) {
    try {
      const validatedBody = c.get('validatedBody');
      const { title, description, startTime, endTime, familyId } = validatedBody;

      // Get user from context
      const userId = c.get('userId');

      // Check if user is member of family
      const membership = await prisma.familyMember.findFirst({
        where: {
          userId,
          familyId,
          deletedAt: null
        }
      });

      if (!membership) {
        throw new AppError({
          code: 'NOT_FAMILY_MEMBER',
          message: 'User is not a member of this family',
          statusCode: 403
        });
      }

      // Create event
      const event = await prisma.event.create({
        data: {
          title,
          description,
          startTime: new Date(startTime),
          endTime: new Date(endTime),
          familyId,
          createdById: userId
        }
      });

      return new Response(
        JSON.stringify(event),
        { status: 201, headers: { 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      if (error instanceof ValidationException || error instanceof AppError) {
        throw error;
      }
      throw new AppError({
        code: 'CREATE_EVENT_FAILED',
        message: 'Failed to create event',
        statusCode: 500
      });
    }
  }

  static async getById(c: Context) {
    try {
      const eventId = c.req.param('id');
      const userId = c.get('userId');

      // Get event with family details
      const event = await prisma.event.findUnique({
        where: { id: eventId },
        include: { family: true }
      });

      if (!event) {
        throw new AppError({
          code: 'EVENT_NOT_FOUND',
          message: 'Event not found',
          statusCode: 404
        });
      }

      // Check if user is member of family
      const membership = await prisma.familyMember.findFirst({
        where: {
          userId,
          familyId: event.familyId,
          deletedAt: null
        }
      });

      if (!membership) {
        throw new AppError({
          code: 'NOT_FAMILY_MEMBER',
          message: 'User is not a member of this family',
          statusCode: 403
        });
      }

      return new Response(
        JSON.stringify(event),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      if (error instanceof ValidationException || error instanceof AppError) {
        throw error;
      }
      throw new AppError({
        code: 'GET_EVENT_FAILED',
        message: 'Failed to get event',
        statusCode: 500
      });
    }
  }

  static async update(c: Context) {
    try {
      const eventId = c.req.param('id');
      const validatedBody = c.get('validatedBody');
      const { title, description, startTime, endTime } = validatedBody;
      const userId = c.get('userId');

      // Get event
      const event = await prisma.event.findUnique({
        where: { id: eventId }
      });

      if (!event) {
        throw new AppError({
          code: 'EVENT_NOT_FOUND',
          message: 'Event not found',
          statusCode: 404
        });
      }

      // Check if user is creator
      if (event.createdById !== userId) {
        throw new AppError({
          code: 'NOT_EVENT_CREATOR',
          message: 'Only event creator can update event',
          statusCode: 403
        });
      }

      // Update event
      const updatedEvent = await prisma.event.update({
        where: { id: eventId },
        data: {
          title,
          description,
          startTime: new Date(startTime),
          endTime: new Date(endTime)
        }
      });

      return new Response(
        JSON.stringify(updatedEvent),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      if (error instanceof ValidationException || error instanceof AppError) {
        throw error;
      }
      throw new AppError({
        code: 'UPDATE_EVENT_FAILED',
        message: 'Failed to update event',
        statusCode: 500
      });
    }
  }

  static async delete(c: Context) {
    try {
      const eventId = c.req.param('id');
      const userId = c.get('userId');

      // Get event with family details
      const event = await prisma.event.findUnique({
        where: { id: eventId },
        include: { family: true }
      });

      if (!event) {
        throw new AppError({
          code: 'EVENT_NOT_FOUND',
          message: 'Event not found',
          statusCode: 404
        });
      }

      // Check if user is creator or parent
      const membership = await prisma.familyMember.findFirst({
        where: {
          userId,
          familyId: event.familyId,
          deletedAt: null
        }
      });

      if (!membership) {
        throw new AppError({
          code: 'NOT_FAMILY_MEMBER',
          message: 'User is not a member of this family',
          statusCode: 403
        });
      }

      if (event.createdById !== userId && membership.role !== 'PARENT') {
        throw new AppError({
          code: 'NOT_AUTHORIZED',
          message: 'Only event creator or parent can delete event',
          statusCode: 403
        });
      }

      // Delete event
      await prisma.event.delete({
        where: { id: eventId }
      });

      return new Response(null, { status: 204 });
    } catch (error) {
      if (error instanceof ValidationException || error instanceof AppError) {
        throw error;
      }
      throw new AppError({
        code: 'DELETE_EVENT_FAILED',
        message: 'Failed to delete event',
        statusCode: 500
      });
    }
  }

  static async listByFamily(c: Context) {
    try {
      const familyId = c.req.param('id');
      const userId = c.get('userId');

      // Check if user is member of family
      const membership = await prisma.familyMember.findFirst({
        where: {
          userId,
          familyId,
          deletedAt: null
        }
      });

      if (!membership) {
        throw new AppError({
          code: 'NOT_FAMILY_MEMBER',
          message: 'User is not a member of this family',
          statusCode: 403
        });
      }

      // Get query params
      const startDate = c.req.query('startDate');
      const endDate = c.req.query('endDate');
      const sortBy = c.req.query('sortBy') || 'startTime';
      const sortOrder = c.req.query('sortOrder') || 'asc';

      // Build where clause
      const where: any = { familyId };
      if (startDate) {
        where.startTime = { gte: new Date(startDate) };
      }
      if (endDate) {
        where.endTime = { lte: new Date(endDate) };
      }

      // Get events
      const events = await prisma.event.findMany({
        where,
        orderBy: { [sortBy]: sortOrder }
      });

      return new Response(
        JSON.stringify(events),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      if (error instanceof ValidationException || error instanceof AppError) {
        throw error;
      }
      throw new AppError({
        code: 'LIST_EVENTS_FAILED',
        message: 'Failed to list events',
        statusCode: 500
      });
    }
  }
}