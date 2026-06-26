const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const programSchema = new Schema({
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
  department: {
    type: Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  },
  duration: {
    type: Number, // in years
    required: true,
    min: 1
  },
  totalSemesters: {
    type: Number,
    required: true,
    min: 1
  }
}, {
  timestamps: true
});

programSchema.index({ department: 1 });

const Program = mongoose.model('Program', programSchema);

module.exports = Program;
