/**
 * routes/attendance.js
 * ─────────────────────────────────────────────────────────────────────────
 * Attendance management for teachers and students.
 *
 * Teacher routes (role: teacher):
 *   GET  /attendance/class/:classId/students  – list students enrolled in a class
 *   POST /attendance/mark                      – bulk-mark a session's attendance
 *   GET  /attendance/sessions/:classId        – list past sessions for a class
 *   GET  /attendance/summary/:classId         – per-student summary for a class
 *
 * Student/all-auth routes:
 *   GET  /attendance/my                       – authenticated student's own summary
 *
 * Thin: HTTP path + middleware → controller method.
 * ─────────────────────────────────────────────────────────────────────────
 */
const router = require('express').Router();
const { verifyToken, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const schemas = require('../validators/attendance.schema');
const ctrl = require('../controllers/attendance.controller');

router.get('/class/:classId/students', verifyToken, ctrl.classStudents);
router.post('/mark', verifyToken, validate({ body: schemas.markAttendance }), ctrl.mark);
router.get('/sessions/:classId', verifyToken, ctrl.sessions);
router.get('/summary/:classId', verifyToken, ctrl.summary);
router.get('/my', verifyToken, ctrl.my);
router.get('/teacher/:teacherId/recent', verifyToken, ctrl.teacherRecent);

module.exports = router;
