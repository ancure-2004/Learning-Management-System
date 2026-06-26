/**
 * Syllabus controller — HTTP layer: reads the request, calls the service,
 * shapes the response. No business logic or DB access here.
 */
const asyncHandler = require('../utils/asyncHandler');
const syllabusService = require('../services/syllabus.service');

exports.create = asyncHandler(async (req, res) => {
  const syllabus = await syllabusService.create(req.body);
  res.status(201).json({
    message: 'Syllabus created successfully',
    syllabus,
  });
});

exports.getBySubject = asyncHandler(async (req, res) => {
  const result = await syllabusService.getBySubject(req.params.subjectId, req.query);
  res.json(result);
});

exports.update = asyncHandler(async (req, res) => {
  const syllabus = await syllabusService.update(req.params.id, req.body);
  res.json({
    message: 'Syllabus updated successfully',
    syllabus,
  });
});

exports.getByYear = asyncHandler(async (req, res) => {
  const result = await syllabusService.getByYear(req.params.academicYear, req.query);
  res.json(result);
});

exports.remove = asyncHandler(async (req, res) => {
  const deletedSyllabus = await syllabusService.remove(req.params.id);
  res.json({
    message: 'Syllabus deleted successfully',
    deletedSyllabus,
  });
});

exports.addUnit = asyncHandler(async (req, res) => {
  const syllabus = await syllabusService.addUnit(req.params.id, req.body);
  res.json({
    message: 'Unit added successfully',
    syllabus,
  });
});

exports.updateUnit = asyncHandler(async (req, res) => {
  const unit = await syllabusService.updateUnit(req.params.id, req.params.unitNumber, req.body);
  res.json({
    message: 'Unit updated successfully',
    unit,
  });
});

exports.removeUnit = asyncHandler(async (req, res) => {
  const syllabus = await syllabusService.removeUnit(req.params.id, req.params.unitNumber);
  res.json({
    message: 'Unit deleted successfully',
    syllabus,
  });
});
