const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const classroomSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  capacity: {
    type: Number,
    required: true
  }
}, {
  timestamps: true,
});

const Classroom = mongoose.model('Classroom', classroomSchema);

module.exports = Classroom;