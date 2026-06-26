/**
 * Report validation schemas.
 */
const { z } = require('zod');

const generate = z.object({
  reportType: z.string().min(1),
  filters: z.object({}).passthrough().optional(),
  dateRange: z.object({}).passthrough().optional(),
  save: z.coerce.boolean().optional(),
}).passthrough();

module.exports = { generate };
