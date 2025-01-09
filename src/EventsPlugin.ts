import * as z from 'zod';
import { PrismaClient } from '@prisma/client';
import { BasePlugin, PluginConfig, PluginContext } from './types/sdk';
import { EventService } from './services/EventService';
import { EventController } from './controllers/EventController';

// Configuration schema using Zod for validation
const EventPluginConfigSchema = z.object({
  maxEventsPerFamily: z.number().min(1).max(100).default(50),
  enableRecurrence: z.boolean().default(true),
  allowCrossUserEvents: z.boolean().default(false)
});

// Explicit type definition for configuration
interface EventPluginConfig {
  maxEventsPerFamily: number;
  enableRecurrence: boolean;
  allowCrossUserEvents: boolean;
}

export class EventsPlugin extends BasePlugin {
  private eventService!: EventService;
  private eventController!: EventController;
  private prisma: PrismaClient;

  constructor(config: PluginConfig) {
    super(config);
    this.prisma = new PrismaClient();
  }

  async init(context: PluginContext): Promise<void> {
    try {
      // Validate configuration and convert to explicit type
      const validatedConfig = EventPluginConfigSchema.parse(
        context.config || {}
      ) as EventPluginConfig;

      // Initialize services and controllers
      this.eventService = new EventService(
        this.prisma, 
        {
          maxEventsPerFamily: validatedConfig.maxEventsPerFamily,
          enableRecurrence: validatedConfig.enableRecurrence,
          allowCrossUserEvents: validatedConfig.allowCrossUserEvents
        },
        context.eventBus
      );

      this.eventController = new EventController(this.eventService);

      // Register routes
      this.registerRoutes(context);

      // Log initialization
      this.logger.info('Events plugin initialized', {
        config: validatedConfig
      });
    } catch (error) {
      this.logger.error('Failed to initialize Events plugin', error);
      throw error;
    }
  }

  private registerRoutes(context: PluginContext): void {
    const baseRoute = '/api/events';
    
    context.app.post(`${baseRoute}`, this.eventController.createEvent);
    context.app.get(`${baseRoute}/:id`, this.eventController.getEvent);
    context.app.get(`${baseRoute}/family/:familyId`, this.eventController.getFamilyEvents);
  }

  async getHealth(): Promise<any> {
    try {
      // Perform health checks
      const eventCount = await this.prisma.event.count();
      const lastEventCreated = await this.prisma.event.findFirst({
        orderBy: { createdAt: 'desc' }
      });

      return {
        status: 'healthy',
        eventCount,
        lastEventCreated: lastEventCreated?.createdAt,
        databaseConnected: true
      };
    } catch (error) {
      this.logger.error('Health check failed', error);
      return {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}