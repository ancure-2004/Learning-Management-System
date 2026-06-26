/**
 * Timetable validation schemas.
 *
 * These validate REQUIRED top-level fields only and use `.passthrough()` so the
 * big nested schedule structure (and any extra fields) flow through untouched.
 */
const { z } = require('zod');

// POST /generate/:classId — both fields optional, mostly permissive.
const generate = z.object({
  academicYear: z.string().optional(),
  adaptiveMode: z.boolean().optional(),
}).passthrough();

// POST /generate-all
const generateAll = z.object({
  classIds: z.array(z.any()).optional(),
  academicYear: z.string().optional(),
  adaptiveMode: z.boolean().optional(),
}).passthrough();

// PUT /:id/edit — require the schedule array is present; don't deep-validate it.
const saveEdit = z.object({
  schedule: z.array(z.any()),
  changes: z.string().optional(),
}).passthrough();

// POST /:id/validate-slot
const validateSlot = z.object({
  day: z.coerce.number(),
  slot: z.coerce.number(),
  proposedData: z.any(),
}).passthrough();

module.exports = { generate, generateAll, saveEdit, validateSlot };
