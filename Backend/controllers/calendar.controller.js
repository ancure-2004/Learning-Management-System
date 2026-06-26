/**
 * Calendar controller — HTTP layer: reads the request, calls the service,
 * shapes the response. No business logic or DB access here.
 */
const asyncHandler = require('../utils/asyncHandler');
const calendarService = require('../services/calendar.service');

exports.create = asyncHandler(async (req, res) => {
  const event = await calendarService.create(req.body, req.user._id, req.app.get('io'));
  res.status(201).json(event);
});

exports.list = asyncHandler(async (req, res) => {
  const events = await calendarService.list(req.query);
  res.json(events);
});

exports.blockedDays = asyncHandler(async (req, res) => {
  const result = await calendarService.blockedDays(req.query);
  res.json(result);
});

exports.getById = asyncHandler(async (req, res) => {
  const event = await calendarService.getById(req.params.id);
  res.json(event);
});

exports.update = asyncHandler(async (req, res) => {
  const event = await calendarService.update(req.params.id, req.body, req.app.get('io'));
  res.json(event);
});

exports.remove = asyncHandler(async (req, res) => {
  const event = await calendarService.remove(req.params.id, req.app.get('io'));
  res.json({ message: 'Event deleted', event });
});
