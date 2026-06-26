/**
 * Classroom routes — thin: HTTP path + middleware → controller method.
 */
const router = require('express').Router();
const { verifyToken, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const schemas = require('../validators/classroom.schema');
const ctrl = require('../controllers/classroom.controller');

router.get('/', verifyToken, ctrl.list);
router.post('/add', verifyToken, authorize('admin'), validate({ body: schemas.createClassroom }), ctrl.create);
router.put('/:id', verifyToken, authorize('admin'), validate({ body: schemas.updateClassroom }), ctrl.update);
router.delete('/:id', verifyToken, authorize('admin'), ctrl.remove);

module.exports = router;
