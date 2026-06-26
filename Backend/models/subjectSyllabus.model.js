const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Stores the syllabus structure and university requirements for each subject
const subjectSyllabusSchema = new Schema({
  subject: {
    type: Schema.Types.ObjectId,
    ref: 'Subject',
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
  
  // University Requirements
  totalRequiredHours: {
    type: Number,
    required: true,
    min: 0,
    default: 60
  },
  theoryHours: {
    type: Number,
    default: 0
  },
  labHours: {
    type: Number,
    default: 0
  },
  
  // Syllabus Structure
  units: [{
    unitNumber: {
      type: Number,
      required: true
    },
    unitName: {
      type: String,
      required: true,
      trim: true
    },
    topics: [{
      topicName: {
        type: String,
        required: true,
        trim: true
      },
      plannedHours: {
        type: Number,
        default: 2
      },
      learningOutcomes: [String],
      prerequisites: [String], // Topic names that must be completed first
      difficulty: {
        type: Number,
        min: 1,
        max: 5,
        default: 3
      },
      isLabSession: {
        type: Boolean,
        default: false
      }
    }]
  }],
  
  // Assessment Weights
  midtermWeight: {
    type: Number,
    default: 30
  },
  endsemWeight: {
    type: Number,
    default: 50
  },
  assignmentWeight: {
    type: Number,
    default: 20
  },
  
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Ensure one syllabus per subject per semester
subjectSyllabusSchema.index({ subject: 1, academicYear: 1, semester: 1 }, { unique: true });

const SubjectSyllabus = mongoose.model('SubjectSyllabus', subjectSyllabusSchema);

module.exports = SubjectSyllabus;
