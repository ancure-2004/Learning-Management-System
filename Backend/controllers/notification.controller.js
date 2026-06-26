/**
 * Notification controller — HTTP layer: reads the request, calls the service,
 * shapes the response. No business logic or DB access here.
 */
const asyncHandler = require('../utils/asyncHandler');
const notificationService = require('../services/notification.service');

exports.list = asyncHandler(async (req, res) => {
  const result = await notificationService.listForUser(req.user._id, req.query);
  res.json(result);
});

exports.unreadCount = asyncHandler(async (req, res) => {
  const result = await notificationService.unreadCount(req.user._id);
  res.json(result);
});

exports.markAllRead = asyncHandler(async (req, res) => {
  const result = await notificationService.markAllRead(req.user._id);
  res.json(result);
});

exports.markRead = asyncHandler(async (req, res) => {
  const notification = await notificationService.markRead(req.params.id, req.user._id);
  res.json(notification);
});

exports.remove = asyncHandler(async (req, res) => {
  await notificationService.remove(req.params.id, req.user._id);
  res.json({ message: 'Notification deleted' });
});
