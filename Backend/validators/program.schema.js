/**
 * Program validation schemas.
 */
const { z } = require('zod');

const createProgram = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
  department: z.string().min(1),
  duration: z.coerce.number().positive(),
  totalSemesters: z.coerce.number().positive(),
}).passthrough();

const updateProgram = z.object({
  name: z.string().min(1).optional(),
  code: z.string().min(1).optional(),
  department: z.string().min(1).optional(),
  duration: z.coerce.number().positive().optional(),
  totalSemesters: z.coerce.number().positive().optional(),
}).passthrough();

module.exports = { createProgram, updateProgram };
