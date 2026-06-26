/**
 * Subject routes — thin: HTTP path + middleware → controller method.
 * (Reference implementation for the route → controller → service pattern.)
 */
const router = require('express').Router();
const { verifyToken, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const schemas = require('../validators/subject.schema');
const ctrl = require('../controllers/subject.controller');

router.get('/', verifyToken, ctrl.list);
router.post('/add', verifyToken, authorize('admin'), validate({ body: schemas.createSubject }), ctrl.create);
router.put('/:id', verifyToken, authorize('admin'), validate({ body: schemas.updateSubject }), ctrl.update);
router.delete('/:id', verifyToken, authorize('admin'), ctrl.remove);

module.exports = router;
