/**
 * Auth routes — thin: HTTP path + middleware → controller method.
 */
const router = require('express').Router();
const { verifyToken, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const schemas = require('../validators/auth.schema');
const ctrl = require('../controllers/auth.controller');

router.post('/register', validate({ body: schemas.register }), ctrl.register);
router.post('/login', validate({ body: schemas.login }), ctrl.login);
router.get('/me', verifyToken, ctrl.me);
router.get('/users', verifyToken, authorize('admin'), ctrl.listUsers);
router.put('/users/:id', verifyToken, ctrl.updateUser);
router.put('/change-password', verifyToken, validate({ body: schemas.changePassword }), ctrl.changePassword);
router.put('/users/:id/deactivate', verifyToken, authorize('admin'), ctrl.deactivateUser);
router.put('/users/:id/activate', verifyToken, authorize('admin'), ctrl.activateUser);
router.delete('/users/:id', verifyToken, authorize('admin'), ctrl.deleteUser);

module.exports = router;
