const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Assigns a subject to a specific class
const classSubjectSchema = new Schema({
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
  // Teacher assigned for this subject in this class
  teacher: {
    type: Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true
  },
  // Room preference (if different from class's default room)
  preferredRoom: {
    type: Schema.Types.ObjectId,
    ref: 'Classroom',
    default: null
  }
}, {
  timestamps: true
});

// Prevent duplicate subject assignments to same class
classSubjectSchema.index({ class: 1, subject: 1 }, { unique: true });
classSubjectSchema.index({ teacher: 1 });

const ClassSubject = mongoose.model('ClassSubject', classSubjectSchema);

module.exports = ClassSubject;
