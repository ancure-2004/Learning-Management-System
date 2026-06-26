/**
 * Auth validation schemas.
 */
const { z } = require('zod');

const register = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: z.enum(['admin', 'teacher', 'student']).optional(),
}).passthrough();

const login = z.object({
  email: z.string().email(),
  password: z.string().min(1),
}).passthrough();

const changePassword = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6),
}).passthrough();

module.exports = { register, login, changePassword };
