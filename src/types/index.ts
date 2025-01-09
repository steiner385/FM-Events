import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { RRule, Weekday } from 'rrule';

// Event Status Enum
export enum EventStatus {
  DRAFT = 'DRAFT',
  SCHEDULED = 'SCHEDULED',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED'
}

// Event Visibility Enum
export enum EventVisibility {
  PRIVATE = 'PRIVATE',
  FAMILY = 'FAMILY',
  PUBLIC = 'PUBLIC'
}

// Recurrence Configuration Schema
export const RecurrenceConfigSchema = z.object({
  frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY']),
  interval: z.number().min(1).default(1),
  byDay: z.array(z.string()).optional(),
  byMonthDay: z.array(z.number()).optional(),
  until: z.date().optional(),
  count: z.number().optional()
});

// Event Configuration Schema
export const EventConfigSchema = z.object({
  features: z.object({
    recurrence: z.boolean().default(true),
    reminders: z.boolean().default(true),
    sharing: z.boolean().default(true)
  }),
  roles: z.object({
    canCreateEvents: z.array(z.string()).default(['PARENT', 'CHILD']),
    canEditAllEvents: z.array(z.string()).default(['PARENT']),
    canDeleteEvents: z.array(z.string()).default(['PARENT'])
  }),
  limits: z.object({
    maxEventsPerUser: z.number().min(1).default(50),
    maxInvitesPerEvent: z.number().min(1).default(20)
  })
});

// Derived Types
export type RecurrenceConfig = z.infer<typeof RecurrenceConfigSchema>;
export type EventConfig = z.infer<typeof EventConfigSchema>;

// Event Interface
export interface Event {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  isAllDay: boolean;
  location?: string;
  status: EventStatus;
  visibility: EventVisibility;
  
  // Recurrence Support
  recurrenceRule?: string; // RRULE standard format
  recurrenceConfig?: RecurrenceConfig;
  
  // Relationships
  userId: string;
  familyId: string;
  taskId?: string;
  
  // Metadata
  metadata?: Record<string, any>;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// Event Invitation Interface
export interface EventInvitation {
  id: string;
  eventId: string;
  userId: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
  role: 'ORGANIZER' | 'ATTENDEE' | 'OPTIONAL';
}

// Event Reminder Interface
export interface EventReminder {
  id: string;
  eventId: string;
  userId: string;
  reminderTime: Date;
  notificationMethod: 'EMAIL' | 'SMS' | 'PUSH_NOTIFICATION';
}

// Type Guards and Utility Functions
export function isValidEventStatus(status: unknown): status is EventStatus {
  return typeof status === 'string' && 
         Object.values(EventStatus).includes(status as EventStatus);
}

export function isValidEventVisibility(visibility: unknown): visibility is EventVisibility {
  return typeof visibility === 'string' && 
         Object.values(EventVisibility).includes(visibility as EventVisibility);
}

export function convertEventStatusForPrisma(
  status: unknown
): Prisma.EnumEventStatusFilter<"Event"> | undefined {
  if (status === undefined || status === null) return undefined;
  
  if (!isValidEventStatus(status)) {
    throw new Error(`Invalid EventStatus: ${String(status)}`);
  }
  
  return {
    equals: status
  };
}

// Event-related Event Types
export type EventEventType = 
  | 'event.created'
  | 'event.updated'
  | 'event.deleted'
  | 'event.invited'
  | 'event.reminder.sent'
  | 'event.status.changed';

// Utility Types
export type Optional<T> = T | null | undefined;
export type Nullable<T> = T | null;

// Utility function to convert weekday to string
function convertWeekdayToString(day: Weekday | number): string {
  if (typeof day === 'number') {
    // Assuming RRule's weekday constants (0 = Sunday, 6 = Saturday)
    const weekdays = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
    return weekdays[day] || '';
  }
  return day.toString();
}

// Recurrence Utility Function
export function parseRecurrenceRule(ruleString: string): RecurrenceConfig {
  try {
    const rule = RRule.fromString(ruleString);
    return {
      frequency: rule.options.freq as any,
      interval: rule.options.interval,
      byDay: rule.options.byweekday?.map(convertWeekdayToString),
      byMonthDay: rule.options.bymonthday,
      until: rule.options.until ?? undefined,
      count: rule.options.count ?? undefined
    };
  } catch (error) {
    throw new Error(`Invalid recurrence rule: ${ruleString}`);
  }
}