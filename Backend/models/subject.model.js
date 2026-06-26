const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const subjectSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 2
  },
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  lectures_per_week: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  // New fields for Phase 2
  subjectType: {
    type: String,
    enum: ['theory', 'lab', 'practical'],
    default: 'theory'
  },
  credits: {
    type: Number,
    default: 0,
    min: 0
  },
  department: {
    type: Schema.Types.ObjectId,
    ref: 'Department',
    default: null
  }
}, {
  timestamps: true,
});

const Subject = mongoose.model('Subject', subjectSchema);

module.exports = Subject;