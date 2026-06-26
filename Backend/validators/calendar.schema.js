/**
 * Calendar validation schemas.
 */
const { z } = require('zod');

const createCalendarEvent = z.object({
  title: z.string().min(1),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  eventType: z.enum(['holiday', 'exam', 'event', 'vacation']),
  academicYear: z.string().min(1),
  description: z.string().optional(),
  isRecurring: z.boolean().optional(),
}).passthrough();

const updateCalendarEvent = z.object({
  title: z.string().min(1).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  eventType: z.enum(['holiday', 'exam', 'event', 'vacation']).optional(),
  academicYear: z.string().min(1).optional(),
  description: z.string().optional(),
  isRecurring: z.boolean().optional(),
}).passthrough();

module.exports = { createCalendarEvent, updateCalendarEvent };
