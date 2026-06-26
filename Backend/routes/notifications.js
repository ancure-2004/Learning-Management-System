/**
 * Notification routes — thin: HTTP path + middleware → controller method.
 */
const router = require('express').Router();
const { verifyToken } = require('../middleware/auth');
const ctrl = require('../controllers/notification.controller');

// GET notifications for a user (paginated) — scoped to authenticated user
router.get('/', verifyToken, ctrl.list);

// GET unread count — scoped to authenticated user
router.get('/unread-count', verifyToken, ctrl.unreadCount);

// MARK ALL as read — scoped to authenticated user
router.put('/read-all', verifyToken, ctrl.markAllRead);

// MARK single notification as read
router.put('/:id/read', verifyToken, ctrl.markRead);

// DELETE notification (own only)
router.delete('/:id', verifyToken, ctrl.remove);

module.exports = router;
