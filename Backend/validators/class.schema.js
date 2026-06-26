/**
 * Class validation schemas.
 */
const { z } = require('zod');

const createClass = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
  program: z.string().min(1),
  semester: z.coerce.number().positive(),
  section: z.string().min(1).optional(),
  assignedRoom: z.string().min(1).optional(),
  studentCount: z.coerce.number().optional(),
}).passthrough();

const updateClass = z.object({
  name: z.string().min(1).optional(),
  code: z.string().min(1).optional(),
  program: z.string().min(1).optional(),
  semester: z.coerce.number().positive().optional(),
  section: z.string().min(1).optional(),
  assignedRoom: z.string().min(1).optional(),
  studentCount: z.coerce.number().optional(),
}).passthrough();

module.exports = { createClass, updateClass };
