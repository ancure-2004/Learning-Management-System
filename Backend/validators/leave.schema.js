/**
 * Leave validation schemas.
 *
 * Mirrors the existing requirements enforced in leave.service:
 *   create() requires leaveType, startDate, endDate, reason.
 *   approve()/reject() bodies carry only an optional adminNote — kept permissive
 *   here (reject's "adminNote required" rule stays in the service, alongside its
 *   trim/whitespace check) so response shapes and side-effects are unchanged.
 */
const { z } = require('zod');

const createLeave = z.object({
  leaveType: z.string().min(1),
  startDate: z.coerce.date(),
  endDate:   z.coerce.date(),
  reason:    z.string().min(1),
  isUrgent:  z.coerce.boolean().optional(),
}).passthrough();

// approve/reject bodies are optional (adminNote?) — permissive, no required fields.
const decideLeave = z.object({
  adminNote: z.string().optional(),
}).passthrough();

module.exports = { createLeave, decideLeave };
