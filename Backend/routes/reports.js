/**
 * Report routes — thin: HTTP path + middleware → controller method.
 */
const router = require('express').Router();
const { verifyToken, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const schemas = require('../validators/report.schema');
const ctrl = require('../controllers/report.controller');

// ─── Generate a report ───────────────────────────────────────────────────────
router.post('/generate', verifyToken, authorize('admin'), validate({ body: schemas.generate }), ctrl.generate);

// ─── List all reports ────────────────────────────────────────────────────────
router.get('/list', verifyToken, authorize('admin'), ctrl.list);

// ─── Get a single report ─────────────────────────────────────────────────────
router.get('/:id', verifyToken, authorize('admin'), ctrl.getById);

// ─── Delete a report ─────────────────────────────────────────────────────────
router.delete('/:id', verifyToken, authorize('admin'), ctrl.remove);

// ─── Export report as CSV ────────────────────────────────────────────────────
router.get('/:id/export/csv', verifyToken, authorize('admin'), ctrl.exportCsv);

// ─── Export report as Excel ──────────────────────────────────────────────────
router.get('/:id/export/excel', verifyToken, authorize('admin'), ctrl.exportExcel);

module.exports = router;
