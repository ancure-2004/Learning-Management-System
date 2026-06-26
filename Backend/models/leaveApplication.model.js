/**
 * LeaveApplication model
 * ─────────────────────────────────────────────────────────────────────────
 * Teacher submits a leave request. Admin approves/rejects.
 * On approval, affected timetable slots are computed and stored so
 * the frontend can show "No Class – Teacher on Leave" for those dates.
 */
const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

const leaveApplicationSchema = new Schema({
  /* ─── Who is applying ─────────────────────────────────────── */
  teacher: {                // User._id of the teacher
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  teacherRecord: {          // Teacher._id (for schedule lookup by name)
    type: Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true,
  },
  teacherName: {            // Denormalised – used to match timetable slot entries
    type: String,
    required: true,
    trim: true,
  },

  /* ─── Leave details ───────────────────────────────────────── */
  leaveType: {
    type: String,
    enum: ['sick', 'casual', 'emergency', 'personal', 'conference', 'other'],
    required: true,
    default: 'casual',
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  reason: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000,
  },
  isUrgent: {              // true → admin sees it flagged in red
    type: Boolean,
    default: false,
  },

  /* ─── Admin decision ──────────────────────────────────────── */
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled'],
    default: 'pending',
  },
  adminNote: {
    type: String,
    trim: true,
    maxlength: 500,
  },
  approvedBy: {             // User._id of admin who acted
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  approvedAt: {
    type: Date,
    default: null,
  },

  /* ─── Teacher cancellation ────────────────────────────────── */
  cancelledAt: {
    type: Date,
    default: null,
  },

  /* ─── Timetable impact (computed on approval) ─────────────── */
  // For each timetable slot that this teacher appears in,
  // we record which actual calendar dates within the leave period
  // fall on that day of the week, so the UI can mark them cancelled.
  affectedSlots: [{
    timetableId:   { type: Schema.Types.ObjectId, ref: 'Timetable' },
    classId:       { type: Schema.Types.ObjectId, ref: 'Class' },
    className:     String,
    dayIndex:      Number,   // 0=Mon … 4=Fri
    slotIndex:     Number,   // 0-7 (8 slots per day)
    subjectName:   String,
    // The specific calendar dates (YYYY-MM-DD strings) affected
    affectedDates: [String],
  }],
}, { timestamps: true });

// Fast lookups
leaveApplicationSchema.index({ teacher: 1, status: 1, startDate: -1 });
leaveApplicationSchema.index({ status: 1, startDate: 1 });

const LeaveApplication = mongoose.model('LeaveApplication', leaveApplicationSchema);
module.exports = LeaveApplication;
