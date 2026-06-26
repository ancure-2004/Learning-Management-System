const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Tracks the teaching progress for a specific subject in a specific class
const teachingProgressSchema = new Schema({
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
  academicYear: {
    type: String,
    required: true,
    trim: true
  },
  semester: {
    type: Number,
    required: true,
    min: 1
  },
  
  // Overall Progress
  totalRequiredHours: {
    type: Number,
    required: true,
    default: 60
  },
  scheduledHours: {
    type: Number,
    default: 0
  },
  conductedHours: {
    type: Number,
    default: 0
  },
  remainingHours: {
    type: Number,
    default: 0
  },
  completionPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  
  // Topic-wise Progress
  topicProgress: [{
    unitNumber: Number,
    topicName: String,
    status: {
      type: String,
      enum: ['not_started', 'in_progress', 'completed', 're_teaching'],
      default: 'not_started'
    },
    hoursSpent: {
      type: Number,
      default: 0
    },
    completionDate: Date,
    studentMasteryRate: {
      type: Number,
      min: 0,
      max: 100
    },
    needsRevision: {
      type: Boolean,
      default: false
    }
  }],
  
  // Attendance Tracking
  classesScheduled: {
    type: Number,
    default: 0
  },
  classesConducted: {
    type: Number,
    default: 0
  },
  classesCancelled: [{
    date: Date,
    reason: String,
    rescheduled: {
      type: Boolean,
      default: false
    }
  }],
  attendanceRate: {
    type: Number,
    default: 100,
    min: 0,
    max: 100
  },
  
  // Compliance Status
  complianceStatus: {
    type: String,
    enum: ['ahead', 'on_track', 'at_risk', 'behind'],
    default: 'on_track'
  },
  urgencyScore: {
    type: Number,
    default: 0
  },
  
  // Predictions
  projectedCompletionDate: Date,
  estimatedShortfall: {
    type: Number,
    default: 0
  },
  
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Ensure one progress record per class-subject-teacher combination
teachingProgressSchema.index({ class: 1, subject: 1, teacher: 1, academicYear: 1, semester: 1 }, { unique: true });

// Method to calculate and update progress metrics
teachingProgressSchema.methods.updateProgress = function() {
  // Calculate remaining hours
  this.remainingHours = this.totalRequiredHours - this.conductedHours;
  
  // Calculate completion percentage
  this.completionPercentage = this.totalRequiredHours > 0 
    ? Math.round((this.conductedHours / this.totalRequiredHours) * 100)
    : 0;
  
  // Calculate attendance rate
  this.attendanceRate = this.classesScheduled > 0
    ? Math.round((this.classesConducted / this.classesScheduled) * 100)
    : 100;
  
  // Determine compliance status
  const percentage = this.completionPercentage;
  const expectedPercentage = this.calculateExpectedCompletion();
  
  if (percentage >= expectedPercentage + 10) {
    this.complianceStatus = 'ahead';
  } else if (percentage >= expectedPercentage - 10) {
    this.complianceStatus = 'on_track';
  } else if (percentage >= expectedPercentage - 20) {
    this.complianceStatus = 'at_risk';
  } else {
    this.complianceStatus = 'behind';
  }
  
  // Calculate urgency score (hours needed per week)
  const weeksRemaining = this.calculateWeeksRemaining();
  this.urgencyScore = weeksRemaining > 0 
    ? Math.max(0, this.remainingHours / weeksRemaining)
    : 0;
  
  this.lastUpdated = new Date();
};

// Helper method to calculate expected completion percentage based on time elapsed
teachingProgressSchema.methods.calculateExpectedCompletion = function() {
  // Assuming a 16-week semester
  const totalWeeks = 16;
  const currentWeek = this.getCurrentWeek();
  
  return Math.round((currentWeek / totalWeeks) * 100);
};

// Helper method to get current week of semester
teachingProgressSchema.methods.getCurrentWeek = function() {
  // This is a simplified version - you'd need to set semester start date
  const semesterStart = new Date(this.academicYear + '-08-01'); // Assuming Aug 1 start
  const now = new Date();
  const weeksPassed = Math.floor((now - semesterStart) / (7 * 24 * 60 * 60 * 1000));
  
  return Math.max(1, Math.min(16, weeksPassed));
};

// Helper method to calculate weeks remaining in semester
teachingProgressSchema.methods.calculateWeeksRemaining = function() {
  const currentWeek = this.getCurrentWeek();
  return Math.max(0, 16 - currentWeek);
};

const TeachingProgress = mongoose.model('TeachingProgress', teachingProgressSchema);

module.exports = TeachingProgress;
