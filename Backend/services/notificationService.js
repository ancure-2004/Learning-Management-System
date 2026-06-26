const Notification = require('../models/notification.model');

let ioInstance = null;

/**
 * Initialize the notification service with a Socket.IO instance.
 * Call this once when setting up the server.
 */
function init(io) {
    ioInstance = io;
    console.log('📢 Notification service initialized with Socket.IO');
}

/**
 * Send a notification to a specific user.
 * Creates a DB record and emits via Socket.IO in real-time.
 */
async function notifyUser({ recipientId, title, message, type = 'info', category = 'system', relatedEntity = null }) {
    try {
        const notification = new Notification({
            recipient: recipientId,
            title,
            message,
            type,
            category,
            relatedEntity
        });

        const saved = await notification.save();

        // Emit via Socket.IO to the specific user's room
        if (ioInstance) {
            ioInstance.to(`user-${recipientId}`).emit('new-notification', saved);
        }

        return saved;
    } catch (err) {
        console.error('❌ Error sending notification:', err.message);
        return null;
    }
}

/**
 * Send a notification to all users with a given role.
 * Useful for broadcasting timetable changes, system announcements, etc.
 */
async function notifyRole({ role, title, message, type = 'info', category = 'system', relatedEntity = null }) {
    try {
        // We need the User model to find users by role
        const User = require('../models/user.model');
        const users = await User.find({ role, isActive: true }).select('_id');

        const notifications = await Promise.all(
            users.map(user =>
                notifyUser({
                    recipientId: user._id,
                    title,
                    message,
                    type,
                    category,
                    relatedEntity
                })
            )
        );

        console.log(`📢 Sent "${title}" notification to ${notifications.filter(Boolean).length} ${role}(s)`);
        return notifications.filter(Boolean);
    } catch (err) {
        console.error('❌ Error sending role notification:', err.message);
        return [];
    }
}

/**
 * Convenience: Notify about a timetable change.
 */
async function notifyTimetableChange({ timetableId, className, action = 'updated' }) {
    const title = `Timetable ${action}`;
    const message = `The timetable for ${className} has been ${action}.`;

    // Notify all admins
    await notifyRole({
        role: 'admin',
        title,
        message,
        type: 'info',
        category: 'timetable',
        relatedEntity: { entityType: 'Timetable', entityId: timetableId }
    });

    // Notify all teachers
    await notifyRole({
        role: 'teacher',
        title,
        message,
        type: 'info',
        category: 'schedule_change',
        relatedEntity: { entityType: 'Timetable', entityId: timetableId }
    });
}

/**
 * Convenience: Notify about a calendar event creation.
 */
async function notifyCalendarEvent({ eventTitle, eventType }) {
    const title = `📅 New ${eventType}: ${eventTitle}`;
    const message = `A new ${eventType} "${eventTitle}" has been added to the academic calendar.`;

    await notifyRole({
        role: 'admin',
        title,
        message,
        type: 'info',
        category: 'system'
    });

    await notifyRole({
        role: 'teacher',
        title,
        message,
        type: 'info',
        category: 'schedule_change'
    });

    await notifyRole({
        role: 'student',
        title,
        message,
        type: 'info',
        category: 'system'
    });
}

module.exports = {
    init,
    notifyUser,
    notifyRole,
    notifyTimetableChange,
    notifyCalendarEvent
};
