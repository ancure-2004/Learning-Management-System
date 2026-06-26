/**
 * Rating controller — HTTP layer: reads the request, calls the service,
 * shapes the response. No business logic or DB access here.
 */
const asyncHandler = require('../utils/asyncHandler');
const ratingService = require('../services/rating.service');

exports.submit = asyncHandler(async (req, res) => {
  // Use authenticated user ID instead of trusting req.body.studentId
  const studentId = req.user._id.toString();
  const { updated, rating } = await ratingService.submit(studentId, req.body);
  if (updated) {
    return res.status(200).json({ message: 'Rating updated successfully', rating });
  }
  res.status(201).json({ message: 'Rating submitted successfully', rating });
});

exports.getTeacherRatings = asyncHandler(async (req, res) => {
  const result = await ratingService.getTeacherRatings(req.params.teacherId, req.query);
  res.json(result);
});

exports.getAggregate = asyncHandler(async (req, res) => {
  const aggregateData = await ratingService.getAggregate(req.params.teacherId, req.query);
  res.json(aggregateData);
});

exports.getTrends = asyncHandler(async (req, res) => {
  const result = await ratingService.getTrends(req.params.teacherId, req.query);
  res.json(result);
});

exports.getMyTeachers = asyncHandler(async (req, res) => {
  const result = await ratingService.getMyTeachers(req.params.studentId, req.query);
  res.json(result);
});

exports.getDepartmentAverage = asyncHandler(async (req, res) => {
  const result = await ratingService.getDepartmentAverage(req.params.departmentId, req.query);
  res.json(result);
});
