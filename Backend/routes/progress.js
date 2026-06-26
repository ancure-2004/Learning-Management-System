/**
 * Progress routes — thin: HTTP path + middleware → controller method.
 */
const router = require('express').Router();
const { verifyToken } = require('../middleware/auth');
const validate = require('../middleware/validate');
const schemas = require('../validators/progress.schema');
const ctrl = require('../controllers/progress.controller');

// Log a new class session
router.post('/log-session', verifyToken, validate({ body: schemas.logSession }), ctrl.logSession);

// Get progress for a specific subject in a class
router.get('/subject/:subjectId/:classId', verifyToken, ctrl.getSubjectProgress);

// Get progress for all subjects in a class
router.get('/class/:classId', verifyToken, ctrl.getClassProgress);

// Get compliance status for a class
router.get('/compliance/:classId', verifyToken, ctrl.getCompliance);

// Get sessions for a teacher
router.get('/teacher-sessions/:teacherId', verifyToken, ctrl.getTeacherSessions);

// Initialize progress tracking for a class (run once per semester)
router.post('/initialize/:classId', verifyToken, validate({ body: schemas.initialize }), ctrl.initialize);

module.exports = router;
