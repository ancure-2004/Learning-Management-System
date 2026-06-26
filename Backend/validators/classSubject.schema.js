/**
 * ClassSubject validation schemas.
 */
const { z } = require('zod');

const createClassSubject = z.object({
  classId: z.string().min(1),
  subjectId: z.string().min(1),
  teacherId: z.string().min(1),
  preferredRoom: z.string().min(1).optional(),
}).passthrough();

const updateClassSubject = z.object({
  teacherId: z.string().min(1).optional(),
  preferredRoom: z.string().min(1).optional(),
}).passthrough();

module.exports = { createClassSubject, updateClassSubject };
