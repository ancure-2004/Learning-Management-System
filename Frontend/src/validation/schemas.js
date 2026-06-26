import { z } from 'zod';

/* ═══════════════════════════════════════════════════════════════
   Client-side zod schemas — mirror the backend Mongoose rules so
   forms catch bad input BEFORE hitting the API (fewer wasted
   requests). Keep these in sync with /Backend/models/*.model.js.
   ═══════════════════════════════════════════════════════════════ */

const email = z.string().trim().min(1, 'Email is required').email('Please enter a valid email address');
const password = z.string().min(6, 'Password must be at least 6 characters');

/* ─── Auth ───────────────────────────────────────────────────── */

export const loginSchema = z.object({
  email,
  password,
});

// Mirrors user.model.js. Student self-registration uses role 'student',
// but the schema accepts the full backend enum + conditional fields so it
// can be reused for admin-created teacher/student records too.
export const registerSchema = z
  .object({
    email,
    password,
    firstName: z.string().trim().min(1, 'First name is required'),
    lastName: z.string().trim().min(1, 'Last name is required'),
    role: z.enum(['admin', 'teacher', 'student']).default('student'),
    phone: z.string().trim().optional().or(z.literal('')),
    confirmPassword: z.string().optional(),
    // Student-specific
    enrollmentNumber: z.string().trim().optional().or(z.literal('')),
    program: z.string().trim().optional().or(z.literal('')),
    semester: z.coerce.number().int().min(1).max(8).optional(),
    section: z.string().trim().optional().or(z.literal('')),
    // Teacher-specific
    department: z.string().trim().optional().or(z.literal('')),
    specialization: z.string().trim().optional().or(z.literal('')),
  })
  // Confirm-password must match when supplied (the Register form sends it).
  .refine(
    (data) => data.confirmPassword === undefined || data.password === data.confirmPassword,
    { path: ['confirmPassword'], message: 'Passwords do not match' }
  );

/* ─── Resources ──────────────────────────────────────────────── */

// Mirrors subject.model.js
export const subjectSchema = z.object({
  name: z.string().trim().min(2, 'Subject name must be at least 2 characters'),
  code: z.string().trim().min(1, 'Subject code is required'),
  lectures_per_week: z.coerce.number().int().min(1, 'Lectures per week must be at least 1'),
  subjectType: z.enum(['theory', 'lab', 'practical']).optional(),
  credits: z.coerce.number().min(0, 'Credits cannot be negative').optional(),
});

// Mirrors classroom.model.js
export const classroomSchema = z.object({
  name: z.string().trim().min(1, 'Classroom name is required'),
  capacity: z.coerce.number().int().positive('Capacity must be a positive number'),
});
