/**
 * Department routes — thin: HTTP path + middleware → controller method.
 */
const router = require('express').Router();
const { verifyToken, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const schemas = require('../validators/department.schema');
const ctrl = require('../controllers/department.controller');

router.get('/', verifyToken, ctrl.list);
router.get('/:id', verifyToken, ctrl.getOne);
router.post('/add', verifyToken, authorize('admin'), validate({ body: schemas.createDepartment }), ctrl.create);
router.put('/:id', verifyToken, authorize('admin'), validate({ body: schemas.updateDepartment }), ctrl.update);
router.delete('/:id', verifyToken, authorize('admin'), ctrl.remove);

module.exports = router;
