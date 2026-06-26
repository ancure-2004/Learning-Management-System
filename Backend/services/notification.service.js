/**
 * Notification service — business logic + data access for the notification
 * CRUD endpoints (per-user inbox). Distinct from services/notificationService.js,
 * which is the Socket.IO push infrastructure used elsewhere.
 * Throw ApiError for expected failures; the central error handler formats them.
 */
const mongoose = require('mongoose');
const Notification = require('../models/notification.model');
const ApiError = require('../utils/ApiError');

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const notificationService = {
  async listForUser(userId, query) {
    const { page = 1, limit = 20, unreadOnly } = query;

    const filter = { recipient: userId };
    if (unreadOnly === 'true') filter.isRead = false;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [notifications, total] = await Promise.all([
      Notification.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Notification.countDocuments(filter),
    ]);

    return {
      notifications,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
    };
  },

  async unreadCount(userId) {
    const count = await Notification.countDocuments({
      recipient: userId,
      isRead: false,
    });
    return { unreadCount: count };
  },

  async markAllRead(userId) {
    const result = await Notification.updateMany(
      { recipient: userId, isRead: false },
      { isRead: true, readAt: new Date() }
    );
    return { message: 'All notifications marked as read', modifiedCount: result.modifiedCount };
  },

  async markRead(id, userId) {
    if (!isValidId(id)) throw ApiError.badRequest('Invalid notification ID');
    const notification = await Notification.findOneAndUpdate(
      { _id: id, recipient: userId },
      { isRead: true, readAt: new Date() },
      { new: true }
    );
    if (!notification) throw ApiError.notFound('Notification not found');
    return notification;
  },

  async remove(id, userId) {
    if (!isValidId(id)) throw ApiError.badRequest('Invalid notification ID');
    const notification = await Notification.findOneAndDelete({
      _id: id,
      recipient: userId,
    });
    if (!notification) throw ApiError.notFound('Notification not found');
    return notification;
  },
};

module.exports = notificationService;
