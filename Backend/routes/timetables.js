/**
 * Timetable routes — thin: HTTP path + middleware → controller method.
 * Route ORDER matters: specific paths (/generate-all, /class/:classId,
 * /teacher/:id, /student/:id, /:id/...) must come before the bare /:id so it
 * doesn't shadow them.
 */
const router = require('express').Router();
const { verifyToken, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const schemas = require('../validators/timetable.schema');
const ctrl = require('../controllers/timetable.controller');

// Generation (admin)
router.post('/generate/:classId', verifyToken, authorize('admin'), validate({ body: schemas.generate }), ctrl.generate);
router.post('/generate-all', verifyToken, authorize('admin'), validate({ body: schemas.generateAll }), ctrl.generateAll);

// Collections / scoped queries (specific before /:id)
router.get('/', verifyToken, ctrl.list);
router.get('/class/:classId', verifyToken, ctrl.getByClass);
router.get('/teacher/:teacherId', verifyToken, ctrl.getForTeacher);
router.get('/student/:studentId', verifyToken, ctrl.getForStudent);

// Editing routes scoped under /:id (specific before bare /:id)
router.post('/:id/validate-slot', verifyToken, validate({ body: schemas.validateSlot }), ctrl.validateSlot);
router.put('/:id/edit', verifyToken, validate({ body: schemas.saveEdit }), ctrl.saveEdit);
router.get('/:id/history', verifyToken, ctrl.getHistory);
router.post('/:id/revert/:versionNumber', verifyToken, authorize('admin'), ctrl.revert);
router.put('/:id/publish', verifyToken, authorize('admin'), ctrl.publish);

// Single resource
router.get('/:id', verifyToken, ctrl.getById);
router.delete('/:id', verifyToken, authorize('admin'), ctrl.remove);

module.exports = router;
