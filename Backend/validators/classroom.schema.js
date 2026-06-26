/**
 * Classroom validation schemas.
 */
const { z } = require('zod');

const createClassroom = z.object({
  name: z.string().min(1),
  capacity: z.coerce.number().positive(),
  type: z.string().min(1).optional(),
}).passthrough();

const updateClassroom = z.object({
  name: z.string().min(1).optional(),
  capacity: z.coerce.number().positive().optional(),
  type: z.string().min(1).optional(),
}).passthrough();

module.exports = { createClassroom, updateClassroom };
