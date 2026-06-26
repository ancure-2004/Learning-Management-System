/**
 * Program routes — thin: HTTP path + middleware → controller method.
 */
const router = require('express').Router();
const { verifyToken, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const schemas = require('../validators/program.schema');
const ctrl = require('../controllers/program.controller');

router.get('/', verifyToken, ctrl.list);
router.get('/department/:departmentId', verifyToken, ctrl.listByDepartment);
router.get('/:id', verifyToken, ctrl.getById);
router.post('/add', verifyToken, authorize('admin'), validate({ body: schemas.createProgram }), ctrl.create);
router.put('/:id', verifyToken, authorize('admin'), validate({ body: schemas.updateProgram }), ctrl.update);
router.delete('/:id', verifyToken, authorize('admin'), ctrl.remove);

module.exports = router;
