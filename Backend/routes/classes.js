/**
 * Class routes — thin: HTTP path + middleware → controller method.
 */
const router = require('express').Router();
const { verifyToken, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const schemas = require('../validators/class.schema');
const ctrl = require('../controllers/class.controller');

router.get('/', verifyToken, ctrl.list);
router.get('/program/:programId', verifyToken, ctrl.listByProgram);
router.get('/:id', verifyToken, ctrl.getById);
router.post('/add', verifyToken, authorize('admin'), validate({ body: schemas.createClass }), ctrl.create);
router.put('/:id', verifyToken, authorize('admin'), validate({ body: schemas.updateClass }), ctrl.update);
router.delete('/:id', verifyToken, authorize('admin'), ctrl.remove);

module.exports = router;
