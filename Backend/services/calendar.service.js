/**
 * Calendar service — business logic + data access for calendar events.
 * Throw ApiError for expected failures; the central error handler formats them.
 */
const mongoose = require('mongoose');
const CalendarEvent = require('../models/calendar.model');
const notificationService = require('./notificationService');
const ApiError = require('../utils/ApiError');

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const calendarService = {
  /**
   * Create an event. `io` is the Socket.IO instance (or null) passed from the
   * controller so this service can emit the same real-time update as before.
   */
  async create(body, createdBy, io) {
    const { title, description, startDate, endDate, eventType, isRecurring, academicYear } = body;

    const event = new CalendarEvent({
      title,
      description,
      startDate,
      endDate,
      eventType,
      isRecurring,
      academicYear,
      createdBy, // Use authenticated user, not req.body
    });

    const savedEvent = await event.save();

    if (io) io.emit('calendar-update', { action: 'created', event: savedEvent });

    try {
      await notificationService.notifyCalendarEvent({
        eventTitle: savedEvent.title,
        eventType: savedEvent.eventType,
      });
    } catch (notifErr) {
      console.warn('Could not send calendar notification:', notifErr.message);
    }

    return savedEvent;
  },

  /**
   * List events. Reads are `.lean()` for throughput.
   * Backward-compatible: returns a plain array UNLESS pagination is requested
   * (page/limit), in which case returns { data, total, page, limit, totalPages }.
   */
  list(query) {
    const { academicYear, eventType, startDate, endDate, page, limit } = query;
    const filter = {};

    if (academicYear) filter.academicYear = academicYear;
    if (eventType) filter.eventType = eventType;
    if (startDate || endDate) {
      filter.startDate = {};
      if (startDate) filter.startDate.$gte = new Date(startDate);
      if (endDate) filter.startDate.$lte = new Date(endDate);
    }

    const baseQuery = CalendarEvent.find(filter).sort({ startDate: 1 }).lean();

    const wantsPage = page !== undefined || limit !== undefined;
    if (!wantsPage) return baseQuery;

    const p = Math.max(1, Number(page) || 1);
    const l = Math.min(100, Math.max(1, Number(limit) || 20));
    return Promise.all([
      baseQuery.skip((p - 1) * l).limit(l),
      CalendarEvent.countDocuments(filter),
    ]).then(([data, total]) => ({
      data,
      total,
      page: p,
      limit: l,
      totalPages: Math.ceil(total / l),
    }));
  },

  async blockedDays(query) {
    const { startDate, endDate } = query;
    if (!startDate || !endDate) {
      throw ApiError.badRequest('startDate and endDate query params are required');
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    const holidays = await CalendarEvent.find({
      eventType: { $in: ['holiday', 'vacation'] },
      startDate: { $lte: end },
      endDate: { $gte: start },
    }).lean();

    const blockedDaysSet = new Set();
    holidays.forEach((holiday) => {
      const hStart = new Date(Math.max(holiday.startDate, start));
      const hEnd = new Date(Math.min(holiday.endDate, end));
      for (let d = new Date(hStart); d <= hEnd; d.setDate(d.getDate() + 1)) {
        const jsDay = d.getDay();
        if (jsDay >= 1 && jsDay <= 5) blockedDaysSet.add(jsDay - 1);
      }
    });

    return {
      blockedDays: Array.from(blockedDaysSet).sort(),
      holidayCount: holidays.length,
      holidays: holidays.map((h) => ({
        title: h.title,
        startDate: h.startDate,
        endDate: h.endDate,
        eventType: h.eventType,
      })),
    };
  },

  async getById(id) {
    if (!isValidId(id)) throw ApiError.badRequest('Invalid event ID');
    const event = await CalendarEvent.findById(id).lean();
    if (!event) throw ApiError.notFound('Event not found');
    return event;
  },

  async update(id, body, io) {
    if (!isValidId(id)) throw ApiError.badRequest('Invalid event ID');
    const event = await CalendarEvent.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    );
    if (!event) throw ApiError.notFound('Event not found');

    if (io) io.emit('calendar-update', { action: 'updated', event });

    return event;
  },

  async remove(id, io) {
    if (!isValidId(id)) throw ApiError.badRequest('Invalid event ID');
    const event = await CalendarEvent.findByIdAndDelete(id);
    if (!event) throw ApiError.notFound('Event not found');

    if (io) io.emit('calendar-update', { action: 'deleted', eventId: id });

    return event;
  },
};

module.exports = calendarService;
