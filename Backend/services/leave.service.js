/**
 * Leave service — business logic + data access for leave applications.
 * Throw ApiError for expected failures; the central error handler formats them.
 *
 * Notifications: this service calls notificationService (notifyRole/notifyUser)
 * directly. notificationService owns the Socket.IO instance internally (set via
 * its init() at startup), so real-time emits continue to work unchanged.
 */
const mongoose  = require('mongoose');
const LeaveApplication = require('../models/leaveApplication.model');
const Timetable = require('../models/timetable.model');
const Teacher   = require('../models/teacher.model');
const notificationService = require('../services/notificationService');
const ApiError  = require('../utils/ApiError');

const isId = (id) => mongoose.Types.ObjectId.isValid(id);

/* ─── Helpers ─────────────────────────────────────────────────── */

/** Returns all calendar dates (as 'YYYY-MM-DD' strings) between start and end
 *  that fall on the given weekday index (0=Mon … 4=Fri).
 */
function datesOnWeekday(startDate, endDate, weekdayIndex) {
  // weekdayIndex: 0=Mon, 1=Tue, 2=Wed, 3=Thu, 4=Fri
  // JS Date.getDay(): 0=Sun,1=Mon,…,5=Fri,6=Sat  → JS weekday = weekdayIndex + 1
  const jsWeekday = weekdayIndex + 1;
  const results = [];
  const cur = new Date(startDate);
  cur.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  while (cur <= end) {
    if (cur.getDay() === jsWeekday) {
      results.push(cur.toISOString().slice(0, 10));
    }
    cur.setDate(cur.getDate() + 1);
  }
  return results;
}

/** Given a teacher name, find all published timetables where that teacher
 *  appears in any slot.  Returns an array of { timetable, affectedSlots[] }.
 */
async function computeAffectedSlots(teacherName, startDate, endDate) {
  const timetables = await Timetable.find({ status: 'published' })
    .populate('class', 'name code')
    .lean();

  const result = [];

  for (const tt of timetables) {
    const schedule = tt.schedule; // 5-day × 8-slot array
    if (!Array.isArray(schedule)) continue;

    for (let day = 0; day < schedule.length; day++) {
      const daySlots = schedule[day];
      if (!Array.isArray(daySlots)) continue;

      for (let slot = 0; slot < daySlots.length; slot++) {
        const slotEntries = daySlots[slot];
        if (!Array.isArray(slotEntries)) continue;

        for (const entry of slotEntries) {
          if (entry && !entry.event && entry.teacher === teacherName) {
            const affectedDates = datesOnWeekday(startDate, endDate, day);
            if (affectedDates.length > 0) {
              result.push({
                timetableId:   tt._id,
                classId:       tt.class?._id || tt.class,
                className:     tt.class?.name || 'Unknown Class',
                dayIndex:      day,
                slotIndex:     slot,
                subjectName:   entry.subject || '—',
                affectedDates,
              });
            }
          }
        }
      }
    }
  }

  return result;
}

const leaveService = {
  /* POST /leave — teacher submits a leave application */
  async create(body, userId) {
    const { leaveType, startDate, endDate, reason, isUrgent } = body;

    if (!leaveType || !startDate || !endDate || !reason) {
      throw ApiError.badRequest('leaveType, startDate, endDate, and reason are required');
    }

    const start = new Date(startDate);
    const end   = new Date(endDate);
    const today = new Date(); today.setHours(0, 0, 0, 0);

    /* Edge case 1: dates in the past */
    if (start < today) {
      throw ApiError.badRequest('Leave start date cannot be in the past');
    }

    /* Edge case 2: end before start */
    if (end < start) {
      throw ApiError.badRequest('End date must be on or after start date');
    }

    /* Resolve teacher record */
    const teacherRecord = await Teacher.findOne({ user: userId });
    if (!teacherRecord) {
      throw ApiError.notFound('Teacher profile not found. Contact admin.');
    }

    /* Edge case 3: overlapping approved leave */
    const overlap = await LeaveApplication.findOne({
      teacher: userId,
      status:  'approved',
      startDate: { $lte: end },
      endDate:   { $gte: start },
    });
    if (overlap) {
      throw new ApiError(409,
        `You already have an approved leave (${overlap.startDate.toISOString().slice(0,10)} – ${overlap.endDate.toISOString().slice(0,10)}) that overlaps with this request.`);
    }

    /* Edge case 4: already a pending application for same period */
    const pendingOverlap = await LeaveApplication.findOne({
      teacher: userId,
      status:  'pending',
      startDate: { $lte: end },
      endDate:   { $gte: start },
    });
    if (pendingOverlap) {
      throw new ApiError(409,
        'You already have a pending leave application that overlaps with this period.');
    }

    const leave = new LeaveApplication({
      teacher:      userId,
      teacherRecord: teacherRecord._id,
      teacherName:  teacherRecord.name,
      leaveType, startDate: start, endDate: end, reason,
      isUrgent: !!isUrgent,
    });
    await leave.save();

    /* Notify all admins */
    await notificationService.notifyRole({
      role: 'admin',
      title: `Leave Request – ${teacherRecord.name}`,
      message: `${teacherRecord.name} has applied for ${leaveType} leave from ${start.toDateString()} to ${end.toDateString()}.`,
      type: isUrgent ? 'warning' : 'info',
      category: 'system',
      relatedEntity: { entityType: 'LeaveApplication', entityId: leave._id },
    });

    return leave;
  },

  /* GET /leave/my — teacher's own leaves */
  async my(userId) {
    const leaves = await LeaveApplication.find({ teacher: userId })
      .populate('approvedBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .lean();
    return { leaves, total: leaves.length };
  },

  /* GET /leave/pending — admin: count + list of pending leaves */
  async pending() {
    const leaves = await LeaveApplication.find({ status: 'pending' })
      .populate('teacher', 'firstName lastName email')
      .sort({ isUrgent: -1, createdAt: 1 })
      .lean();
    return { count: leaves.length, leaves };
  },

  /* GET /leave/overrides — slot-cancellation info for approved leaves in range */
  async overrides(query) {
    const { startDate, endDate } = query;
    if (!startDate || !endDate) {
      throw ApiError.badRequest('startDate and endDate query params required');
    }

    const start = new Date(startDate);
    const end   = new Date(endDate);

    const leaves = await LeaveApplication.find({
      status:    'approved',
      startDate: { $lte: end },
      endDate:   { $gte: start },
    }).populate('teacher', 'firstName lastName').lean();

    const overrides = [];
    const rangeStart = start.toISOString().slice(0, 10);
    const rangeEnd   = end.toISOString().slice(0, 10);

    leaves.forEach(leave => {
      (leave.affectedSlots || []).forEach(slot => {
        const datesInRange = (slot.affectedDates || []).filter(
          d => d >= rangeStart && d <= rangeEnd
        );
        datesInRange.forEach(date => {
          overrides.push({
            leaveId:     leave._id,
            teacherName: leave.teacherName,
            leaveType:   leave.leaveType,
            date,
            dayIndex:    slot.dayIndex,
            slotIndex:   slot.slotIndex,
            classId:     slot.classId,
            className:   slot.className,
            subjectName: slot.subjectName,
          });
        });
      });
    });

    return { overrides, total: overrides.length };
  },

  /* GET /leave — admin: all leaves (with optional status filter) */
  async list(query) {
    const filter = {};
    if (query.status) filter.status = query.status;
    if (query.teacherId && isId(query.teacherId))
      filter.teacher = query.teacherId;

    const leaves = await LeaveApplication.find(filter)
      .populate('teacher', 'firstName lastName email')
      .populate('approvedBy', 'firstName lastName')
      .sort({ isUrgent: -1, createdAt: -1 })
      .lean();

    return { leaves, total: leaves.length };
  },

  /* GET /leave/:id — single application */
  async getById(id) {
    if (!isId(id)) throw ApiError.badRequest('Invalid ID');
    const leave = await LeaveApplication.findById(id)
      .populate('teacher', 'firstName lastName email')
      .populate('approvedBy', 'firstName lastName')
      .lean();
    if (!leave) throw ApiError.notFound('Leave application not found');
    return leave;
  },

  /* PUT /leave/:id/approve — admin approves */
  async approve(id, body, adminId) {
    if (!isId(id)) throw ApiError.badRequest('Invalid ID');

    const leave = await LeaveApplication.findById(id);
    if (!leave) throw ApiError.notFound('Leave application not found');
    if (leave.status !== 'pending') {
      throw new ApiError(409, `Cannot approve a leave that is already ${leave.status}`);
    }

    /* Edge case: check if another leave was approved that overlaps (race condition) */
    const overlap = await LeaveApplication.findOne({
      _id:    { $ne: leave._id },
      teacher: leave.teacher,
      status:  'approved',
      startDate: { $lte: leave.endDate },
      endDate:   { $gte: leave.startDate },
    });
    if (overlap) {
      throw new ApiError(409,
        `An overlapping leave (${overlap.startDate.toISOString().slice(0,10)} – ${overlap.endDate.toISOString().slice(0,10)}) was already approved for this teacher.`);
    }

    /* Compute timetable slot impacts */
    const affectedSlots = await computeAffectedSlots(
      leave.teacherName, leave.startDate, leave.endDate
    );

    leave.status        = 'approved';
    leave.approvedBy    = adminId;
    leave.approvedAt    = new Date();
    leave.adminNote     = body.adminNote || '';
    leave.affectedSlots = affectedSlots;
    await leave.save();

    /* Notify the teacher */
    const affectedCount = affectedSlots.reduce((s, a) => s + a.affectedDates.length, 0);
    await notificationService.notifyUser({
      recipientId: leave.teacher,
      title: '✅ Leave Approved',
      message: `Your ${leave.leaveType} leave from ${leave.startDate.toDateString()} to ${leave.endDate.toDateString()} has been approved.${affectedCount > 0 ? ` ${affectedCount} class session(s) will be marked as cancelled.` : ''}`,
      type: 'success',
      category: 'system',
      relatedEntity: { entityType: 'LeaveApplication', entityId: leave._id },
    });

    /* Notify affected students via role-broadcast if any slots affected */
    if (affectedSlots.length > 0) {
      const uniqueClasses = [...new Set(affectedSlots.map(s => s.className))].join(', ');
      await notificationService.notifyRole({
        role: 'student',
        title: '📢 Class Cancellation Notice',
        message: `Classes by ${leave.teacherName} for ${uniqueClasses} are cancelled during ${leave.startDate.toDateString()} – ${leave.endDate.toDateString()} (teacher on approved leave).`,
        type: 'warning',
        category: 'schedule_change',
        relatedEntity: { entityType: 'LeaveApplication', entityId: leave._id },
      });
    }

    return {
      message: 'Leave approved successfully',
      leave,
      affectedSlots,
      impactSummary: {
        classesAffected: [...new Set(affectedSlots.map(s => s.className))].length,
        sessionsAffected: affectedCount,
      },
    };
  },

  /* PUT /leave/:id/reject — admin rejects */
  async reject(id, body, adminId) {
    if (!isId(id)) throw ApiError.badRequest('Invalid ID');

    const leave = await LeaveApplication.findById(id);
    if (!leave) throw ApiError.notFound('Leave application not found');
    if (leave.status !== 'pending') {
      throw new ApiError(409, `Cannot reject a leave that is already ${leave.status}`);
    }

    const { adminNote } = body;
    if (!adminNote?.trim()) {
      throw ApiError.badRequest('A rejection reason (adminNote) is required');
    }

    leave.status     = 'rejected';
    leave.approvedBy = adminId;
    leave.approvedAt = new Date();
    leave.adminNote  = adminNote.trim();
    await leave.save();

    /* Notify the teacher */
    await notificationService.notifyUser({
      recipientId: leave.teacher,
      title: '❌ Leave Rejected',
      message: `Your ${leave.leaveType} leave request has been rejected. Reason: ${adminNote}`,
      type: 'error',
      category: 'system',
      relatedEntity: { entityType: 'LeaveApplication', entityId: leave._id },
    });

    return { message: 'Leave rejected', leave };
  },

  /* DELETE /leave/:id — teacher cancels a PENDING leave */
  async remove(id, userId) {
    if (!isId(id)) throw ApiError.badRequest('Invalid ID');

    const leave = await LeaveApplication.findOne({
      _id: id, teacher: userId,
    });
    if (!leave) throw ApiError.notFound('Leave application not found');
    if (leave.status !== 'pending') {
      throw new ApiError(409,
        `Cannot cancel a leave that is already ${leave.status}. Contact admin if needed.`);
    }

    leave.status      = 'cancelled';
    leave.cancelledAt = new Date();
    await leave.save();

    /* Notify admins that the pending request was withdrawn */
    await notificationService.notifyRole({
      role: 'admin',
      title: 'Leave Request Withdrawn',
      message: `${leave.teacherName} has withdrawn their leave request for ${leave.startDate.toDateString()} – ${leave.endDate.toDateString()}.`,
      type: 'info',
      category: 'system',
    });

    return { message: 'Leave application cancelled' };
  },
};

module.exports = leaveService;
