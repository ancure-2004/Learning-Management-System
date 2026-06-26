/**
 * Syllabus routes — thin: HTTP path + middleware → controller method.
 */
const router = require('express').Router();
const { verifyToken, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const schemas = require('../validators/syllabus.schema');
const ctrl = require('../controllers/syllabus.controller');

router.post('/create', verifyToken, authorize('admin'), validate({ body: schemas.create }), ctrl.create);
router.get('/:subjectId', verifyToken, ctrl.getBySubject);
router.put('/:id', verifyToken, authorize('admin'), validate({ body: schemas.update }), ctrl.update);
router.get('/year/:academicYear', verifyToken, ctrl.getByYear);
router.delete('/:id', verifyToken, authorize('admin'), ctrl.remove);
router.post('/:id/units', verifyToken, authorize('admin'), validate({ body: schemas.addUnit }), ctrl.addUnit);
router.put('/:id/units/:unitNumber', verifyToken, authorize('admin'), validate({ body: schemas.updateUnit }), ctrl.updateUnit);
router.delete('/:id/units/:unitNumber', verifyToken, authorize('admin'), ctrl.removeUnit);

module.exports = router;
