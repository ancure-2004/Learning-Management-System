const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reportSchema = new Schema({
  reportType: {
    type: String,
    enum: [
      'timetable_utilization',
      'teacher_workload',
      'room_usage',
      'progress_tracking',
      'attendance_analytics',
      'performance_overview'
    ],
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  generatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  dateRange: {
    start: Date,
    end: Date
  },
  filters: {
    department: { type: Schema.Types.ObjectId, ref: 'Department' },
    program: { type: Schema.Types.ObjectId, ref: 'Program' },
    class: { type: Schema.Types.ObjectId, ref: 'Class' },
    teacher: { type: Schema.Types.ObjectId, ref: 'User' },
    subject: { type: Schema.Types.ObjectId, ref: 'Subject' },
    academicYear: String,
    semester: Number
  },
  data: {
    type: Schema.Types.Mixed,
    required: true
  },
  summary: {
    totalRecords: Number,
    keyMetrics: Schema.Types.Mixed
  },
  format: {
    type: String,
    enum: ['pdf', 'excel', 'csv', 'json'],
    default: 'json'
  }
}, {
  timestamps: true
});

reportSchema.index({ reportType: 1, createdAt: -1 });
reportSchema.index({ generatedBy: 1, createdAt: -1 });

const Report = mongoose.model('Report', reportSchema);

module.exports = Report;
