const mongoose = require('mongoose');

const calendarEventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true,
        default: ''
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    eventType: {
        type: String,
        enum: ['holiday', 'exam', 'event', 'vacation'],
        required: true,
        default: 'holiday'
    },
    isRecurring: {
        type: Boolean,
        default: false
    },
    academicYear: {
        type: String,
        required: true,
        trim: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Index for efficient date-range queries
calendarEventSchema.index({ startDate: 1, endDate: 1 });
calendarEventSchema.index({ academicYear: 1, eventType: 1 });
calendarEventSchema.index({ eventType: 1 });

// Validate that endDate >= startDate
calendarEventSchema.pre('validate', function (next) {
    if (this.endDate < this.startDate) {
        this.invalidate('endDate', 'End date must be on or after start date');
    }
    next();
});

const CalendarEvent = mongoose.model('CalendarEvent', calendarEventSchema);

module.exports = CalendarEvent;
