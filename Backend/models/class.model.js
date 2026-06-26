const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// A Class represents a specific group of students (e.g., "CS-A Semester 3")
const classSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  program: {
    type: Schema.Types.ObjectId,
    ref: 'Program',
    required: true
  },
  semester: {
    type: Number,
    required: true,
    min: 1
  },
  section: {
    type: String,
    trim: true,
    uppercase: true,
    default: 'A'
  },
  // Permanent room assignment (if any)
  assignedRoom: {
    type: Schema.Types.ObjectId,
    ref: 'Classroom',
    default: null
  },
  studentCount: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true
});

classSchema.index({ program: 1, semester: 1, section: 1 });

const Class = mongoose.model('Class', classSchema);

module.exports = Class;
