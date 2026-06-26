/**
 * Progress validation schemas.
 * Only reflects fields the service already requires — kept permissive otherwise.
 */
const { z } = require('zod');

// POST /log-session — fields the service marks as required (see progress.service.logSession):
// classId, subjectId, teacherId, date, timeSlot, totalStudents, presentStudents.
// hoursSpent and other fields are optional / defaulted downstream.
const logSession = z.object({
  classId: z.string().min(1),
  subjectId: z.string().min(1),
  teacherId: z.string().min(1),
  date: z.string().min(1),
  timeSlot: z.string().min(1),
  totalStudents: z.coerce.number(),
  presentStudents: z.coerce.number(),
  hoursSpent: z.coerce.number().optional(),
}).passthrough();

// POST /initialize/:classId — body is optional (academicYear, semester); keep permissive.
const initialize = z.object({}).passthrough();

module.exports = { logSession, initialize };
