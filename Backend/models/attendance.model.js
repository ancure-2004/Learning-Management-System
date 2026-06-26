const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Attendance — tracks per-student presence for a single class session.
 * A teacher bulk-creates records (one per student) when marking attendance.
 */
const attendanceSchema = new Schema({
  student: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  class: {
    type: Schema.Types.ObjectId,
    ref: 'Class',
    required: true,
  },
  subject: {
    type: Schema.Types.ObjectId,
    ref: 'Subject',
    required: true,
  },
  teacher: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  timeSlot: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late'],
    required: true,
    default: 'absent',
  },
  markedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, { timestamps: true });

// Prevent duplicate records for the same student/class/subject/date/slot
attendanceSchema.index(
  { student: 1, class: 1, subject: 1, date: 1, timeSlot: 1 },
  { unique: true }
);

// Indexes for fast queries
attendanceSchema.index({ class: 1, subject: 1, date: -1 });
attendanceSchema.index({ class: 1, date: -1 });
attendanceSchema.index({ student: 1, date: -1 });
attendanceSchema.index({ teacher: 1, date: -1 });

const Attendance = mongoose.model('Attendance', attendanceSchema);
module.exports = Attendance;
