/**
 * Calendar routes — thin: HTTP path + middleware → controller method.
 */
const router = require('express').Router();
const { verifyToken, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const schemas = require('../validators/calendar.schema');
const ctrl = require('../controllers/calendar.controller');

// CREATE event (admin only)
router.post('/', verifyToken, authorize('admin'), validate({ body: schemas.createCalendarEvent }), ctrl.create);

// GET all events (authenticated)
router.get('/', verifyToken, ctrl.list);

// GET blocked weekday indices (authenticated — used by solver)
router.get('/blocked-days', verifyToken, ctrl.blockedDays);

// GET single event
router.get('/:id', verifyToken, ctrl.getById);

// UPDATE event (admin only)
router.put('/:id', verifyToken, authorize('admin'), validate({ body: schemas.updateCalendarEvent }), ctrl.update);

// DELETE event (admin only)
router.delete('/:id', verifyToken, authorize('admin'), ctrl.remove);

module.exports = router;
