/**
 * Rating routes — thin: HTTP path + middleware → controller method.
 */
const router = require('express').Router();
const { verifyToken } = require('../middleware/auth');
const validate = require('../middleware/validate');
const schemas = require('../validators/rating.schema');
const ctrl = require('../controllers/rating.controller');

// Submit / update a rating (students only)
router.post('/submit', verifyToken, validate({ body: schemas.submit }), ctrl.submit);

// Get all ratings for a teacher
router.get('/teacher/:teacherId', verifyToken, ctrl.getTeacherRatings);

// Get aggregate statistics for a teacher
router.get('/aggregate/:teacherId', verifyToken, ctrl.getAggregate);

// Get historical trend data for a teacher
router.get('/trends/:teacherId', verifyToken, ctrl.getTrends);

// Get list of teachers a student can rate
router.get('/my-teachers/:studentId', verifyToken, ctrl.getMyTeachers);

// Get department average rating
router.get('/department-average/:departmentId', verifyToken, ctrl.getDepartmentAverage);

module.exports = router;
