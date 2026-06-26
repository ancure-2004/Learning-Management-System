/**
 * Syllabus validation schemas.
 * Only reflects fields the service already requires — kept permissive otherwise.
 * Nested units/topics are passed through, not deep-validated.
 */
const { z } = require('zod');

// POST /create — service requires subjectId, academicYear, semester, totalRequiredHours.
const create = z.object({
  subjectId: z.string().min(1),
  academicYear: z.string().min(1),
  semester: z.coerce.number(),
  totalRequiredHours: z.coerce.number(),
  theoryHours: z.coerce.number().optional(),
  labHours: z.coerce.number().optional(),
}).passthrough();

// PUT /:id — partial $set update; everything optional.
const update = z.object({
  academicYear: z.string().min(1).optional(),
  semester: z.coerce.number().optional(),
  totalRequiredHours: z.coerce.number().optional(),
  theoryHours: z.coerce.number().optional(),
  labHours: z.coerce.number().optional(),
}).passthrough();

// POST /:id/units — service requires unitNumber, unitName; topics passed through.
const addUnit = z.object({
  unitNumber: z.coerce.number(),
  unitName: z.string().min(1),
}).passthrough();

// PUT /:id/units/:unitNumber — service only applies provided fields; all optional.
const updateUnit = z.object({
  unitName: z.string().min(1).optional(),
}).passthrough();

module.exports = { create, update, addUnit, updateUnit };
