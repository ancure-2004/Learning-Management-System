/**
 * routes/leave.js
 * ─────────────────────────────────────────────────────────────────────────
 * Leave Application management.
 *
 * Teacher endpoints:
 *   POST   /leave                       – submit a new leave application
 *   GET    /leave/my                    – teacher views their own leaves
 *   DELETE /leave/:id                   – teacher cancels a pending leave
 *
 * Admin endpoints:
 *   GET    /leave                       – all applications (with filters)
 *   GET    /leave/pending               – only pending count + list
 *   PUT    /leave/:id/approve           – admin approves
 *   PUT    /leave/:id/reject            – admin rejects
 *
 * Shared:
 *   GET    /leave/overrides             – slot cancellations for a date range
 *   GET    /leave/:id                   – single application details
 *
 * Thin: HTTP path + middleware → controller method.
 * Route order matters: /my, /pending, /overrides are declared before /:id
 * so the param route does not shadow them.
 * ─────────────────────────────────────────────────────────────────────────
 */
const router = require('express').Router();
const { verifyToken, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const schemas = require('../validators/leave.schema');
const ctrl = require('../controllers/leave.controller');

router.post('/', verifyToken, validate({ body: schemas.createLeave }), ctrl.create);
router.get('/my', verifyToken, ctrl.my);
router.get('/pending', verifyToken, ctrl.pending);
router.get('/overrides', verifyToken, ctrl.overrides);
router.get('/', verifyToken, ctrl.list);
router.get('/:id', verifyToken, ctrl.getById);
router.put('/:id/approve', verifyToken, validate({ body: schemas.decideLeave }), ctrl.approve);
router.put('/:id/reject', verifyToken, validate({ body: schemas.decideLeave }), ctrl.reject);
router.delete('/:id', verifyToken, ctrl.remove);

module.exports = router;
