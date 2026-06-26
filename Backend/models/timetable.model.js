const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Stores the generated timetable for a specific class
const timetableSchema = new Schema({
  class: {
    type: Schema.Types.ObjectId,
    ref: 'Class',
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
  // The actual timetable data: 5 days × 8 slots
  // Each slot contains: { subject, teacher, classroom } or null/lunch
  schedule: {
    type: Schema.Types.Mixed, // Will store the JSON structure
    required: true
  },
  generatedAt: {
    type: Date,
    default: Date.now
  },
  generatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  
  // Phase 6: Edit tracking fields
  isEdited: {
    type: Boolean,
    default: false
  },
  lastEditedAt: {
    type: Date
  },
  lastEditedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  currentVersion: {
    type: Number,
    default: 1
  },
  editHistory: [{
    versionNumber: Number,
    timestamp: Date,
    editedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    changeDescription: String,
    scheduleSnapshot: Schema.Types.Mixed
  }]
}, {
  timestamps: true
});

// One active timetable per class per semester
timetableSchema.index({ class: 1, academicYear: 1, semester: 1, status: 1 });
timetableSchema.index({ class: 1, status: 1 });
timetableSchema.index({ status: 1 });

const Timetable = mongoose.model('Timetable', timetableSchema);

module.exports = Timetable;
