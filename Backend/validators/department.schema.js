/**
 * Department validation schemas.
 */
const { z } = require('zod');

const createDepartment = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
  description: z.string().optional(),
}).passthrough();

const updateDepartment = z.object({
  name: z.string().min(1).optional(),
  code: z.string().min(1).optional(),
  description: z.string().optional(),
}).passthrough();

module.exports = { createDepartment, updateDepartment };
