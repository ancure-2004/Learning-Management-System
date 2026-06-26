/**
 * Rating validation schemas.
 * studentId is taken from req.user — NOT accepted in the body.
 */
const { z } = require('zod');

const submit = z.object({
  teacherId: z.string().min(1),
  subjectId: z.string().min(1),
  classId: z.string().min(1),
  overallRating: z.coerce.number().min(1).max(5),
  categories: z.object({}).passthrough().optional(),
  feedback: z.string().optional(),
  isAnonymous: z.coerce.boolean().optional(),
  academicYear: z.string().min(1),
  semester: z.coerce.number(),
}).passthrough();

module.exports = { submit };
