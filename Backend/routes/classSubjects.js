/**
 * ClassSubject routes — thin: HTTP path + middleware → controller method.
 */
const router = require('express').Router();
const { verifyToken, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const schemas = require('../validators/classSubject.schema');
const ctrl = require('../controllers/classSubject.controller');

router.get('/', verifyToken, ctrl.list);
router.get('/class/:classId', verifyToken, ctrl.listByClass);
router.get('/teacher/:teacherId', verifyToken, ctrl.listByTeacher);
router.get('/teacher-by-name/:firstName/:lastName', verifyToken, ctrl.listByTeacherName);
router.post('/add', verifyToken, authorize('admin'), validate({ body: schemas.createClassSubject }), ctrl.create);
router.put('/:id', verifyToken, authorize('admin'), validate({ body: schemas.updateClassSubject }), ctrl.update);
router.delete('/:id', verifyToken, authorize('admin'), ctrl.remove);

module.exports = router;
