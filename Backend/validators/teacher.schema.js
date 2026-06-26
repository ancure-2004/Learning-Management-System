/**
 * Teacher validation schemas.
 */
const { z } = require('zod');

const createTeacher = z.object({
  name: z.string().min(1),
  email: z.string().email().optional(),
  department: z.string().min(1).optional(),
  maxHoursPerWeek: z.coerce.number().optional(),
  user: z.string().min(1).optional(),
}).passthrough();

const updateTeacher = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  department: z.string().min(1).optional(),
  maxHoursPerWeek: z.coerce.number().optional(),
  user: z.string().min(1).optional(),
}).passthrough();

module.exports = { createTeacher, updateTeacher };
