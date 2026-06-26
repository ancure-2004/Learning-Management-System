const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Records each individual class session conducted
const sessionLogSchema = new Schema({
  class: {
    type: Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  subject: {
    type: Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  teacher: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  
  // Session Details
  timeSlot: {
    type: String,
    required: true
  },
  hoursSpent: {
    type: Number,
    default: 1,
    min: 0.5,
    max: 4
  },
  sessionType: {
    type: String,
    enum: ['theory', 'lab', 'revision', 'assessment', 'other'],
    default: 'theory'
  },
  
  // Topics Covered
  topicsCovered: [{
    unitNumber: Number,
    topicName: String,
    isCompleted: {
      type: Boolean,
      default: false
    }
  }],
  
  // Attendance
  totalStudents: {
    type: Number,
    required: true
  },
  presentStudents: {
    type: Number,
    required: true
  },
  attendancePercentage: {
    type: Number,
    min: 0,
    max: 100
  },
  
  // Session Quality (Optional)
  teacherNotes: {
    type: String,
    trim: true
  },
  difficulty: {
    type: Number,
    min: 1,
    max: 5
  },
  studentEngagement: {
    type: Number,
    min: 1,
    max: 5
  },
  
  // Metadata
  wasRescheduled: {
    type: Boolean,
    default: false
  },
  originalDate: Date,
  
  loggedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for quick queries
sessionLogSchema.index({ class: 1, subject: 1, date: -1 });
sessionLogSchema.index({ teacher: 1, date: -1 });

// Pre-save hook to calculate attendance percentage
sessionLogSchema.pre('save', function(next) {
  if (this.totalStudents > 0) {
    this.attendancePercentage = Math.round((this.presentStudents / this.totalStudents) * 100);
  }
  next();
});

const SessionLog = mongoose.model('SessionLog', sessionLogSchema);

module.exports = SessionLog;
