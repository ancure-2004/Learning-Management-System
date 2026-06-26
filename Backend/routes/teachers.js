/**
 * Teacher routes — thin: HTTP path + middleware → controller method.
 */
const router = require('express').Router();
const { verifyToken, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const schemas = require('../validators/teacher.schema');
const ctrl = require('../controllers/teacher.controller');

router.get('/', verifyToken, ctrl.list);
router.post('/add', verifyToken, authorize('admin'), validate({ body: schemas.createTeacher }), ctrl.create);
router.put('/:id', verifyToken, authorize('admin'), validate({ body: schemas.updateTeacher }), ctrl.update);
router.get('/user/:userId', verifyToken, ctrl.getByUser);
router.get('/by-name/:name', verifyToken, ctrl.getByName);
router.delete('/:id', verifyToken, authorize('admin'), ctrl.remove);

module.exports = router;
