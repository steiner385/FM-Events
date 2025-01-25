# FM-Events Plugin

## Overview
FM-Events is a sophisticated event management plugin for the FamilyManager ecosystem, providing robust event creation, management, and synchronization capabilities.

## Features
- Flexible event creation and management
- Recurrence support (daily, weekly, monthly, yearly)
- Multi-user and family-based events
- Role-based access control
- Event status tracking
- Comprehensive event configuration

## Installation
```bash
npm install fm-events-plugin
```

## Configuration
```typescript
import { EventsPlugin } from 'fm-events-plugin';
import { PrismaClient } from '@prisma/client';
import { EventBus } from 'your-event-bus';

const prisma = new PrismaClient();
const eventBus = new EventBus();

const eventsPlugin = new EventsPlugin();
await eventsPlugin.init({ 
  app, 
  prisma, 
  eventBus,
  config: {
    features: {
      recurrence: true,
      reminders: true,
      sharing: true
    },
    roles: {
      canCreateEvents: ['PARENT', 'CHILD'],
      canEditAllEvents: ['PARENT'],
      canDeleteEvents: ['PARENT']
    },
    limits: {
      maxEventsPerUser: 50,
      maxInvitesPerEvent: 20
    }
  }
});
```

## Event Types
- Single events
- Recurring events (with advanced recurrence rules)
- Family-wide events
- Private events

## API Endpoints
- `POST /api/events`: Create a new event
- `GET /api/events`: Retrieve events
- `GET /api/events/:id`: Get specific event
- `PUT /api/events/:id`: Update an event
- `DELETE /api/events/:id`: Delete an event

## Event Statuses
- DRAFT
- SCHEDULED
- CONFIRMED
- CANCELLED
- COMPLETED

## Recurrence Support
The plugin supports advanced recurrence rules using the RRule standard, allowing complex recurring event patterns:
- Daily, weekly, monthly, and yearly frequencies
- Interval-based recurrence
- Specific day of week/month selection
- End date or count-based recurrence

## Event Visibility
- PRIVATE: Visible only to the creator
- FAMILY: Visible to family members
- PUBLIC: Visible to all users

## Dependencies
- Prisma
- Hono
- RRule
- Zod
- EventBus

## Contributing
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## Performance and Monitoring
- Comprehensive health checks
- Metrics tracking
- Configurable event limits
- Role-based access control

## License
MIT License

## Contact
For support or questions, please open an issue in the repository.