/**
 * Subject validation schemas.
 */
const { z } = require('zod');

const createSubject = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
  lectures_per_week: z.coerce.number().positive(),
  subjectType: z.string().min(1).optional(),
  credits: z.coerce.number().optional(),
  department: z.string().min(1).optional(),
}).passthrough();

const updateSubject = z.object({
  name: z.string().min(1).optional(),
  code: z.string().min(1).optional(),
  lectures_per_week: z.coerce.number().positive().optional(),
  subjectType: z.string().min(1).optional(),
  credits: z.coerce.number().optional(),
  department: z.string().min(1).optional(),
}).passthrough();

module.exports = { createSubject, updateSubject };
