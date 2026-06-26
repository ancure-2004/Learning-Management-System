/**
 * Attendance validation schemas.
 *
 * Mirrors the existing requirements enforced in attendance.service.mark():
 *   classId, subjectId, teacherId, date, timeSlot, students[] are required.
 * (markedBy is taken from req.user, not the body.)
 */
const { z } = require('zod');

const markAttendance = z.object({
  classId:   z.string().min(1),
  subjectId: z.string().min(1),
  teacherId: z.string().min(1),
  date:      z.coerce.date(),
  timeSlot:  z.string().min(1),
  students:  z.array(z.object({}).passthrough()).min(1),
}).passthrough();

module.exports = { markAttendance };
