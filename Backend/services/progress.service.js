/**
 * Progress service — business logic + data access for teaching progress.
 * Throw ApiError for expected failures; the central error handler formats them.
 */
const SessionLog = require('../models/sessionLog.model');
const TeachingProgress = require('../models/teachingProgress.model');
const ClassSubject = require('../models/classSubject.model');
const Class = require('../models/class.model');
const ApiError = require('../utils/ApiError');

// Helper: update teaching progress after logging a session
async function updateTeachingProgress(classId, subjectId, teacherId) {
  // Find or create progress record
  let progress = await TeachingProgress.findOne({
    class: classId,
    subject: subjectId,
    teacher: teacherId
  });

  if (!progress) {
    // Create new progress record with default values
    progress = new TeachingProgress({
      class: classId,
      subject: subjectId,
      teacher: teacherId,
      academicYear: new Date().getFullYear().toString(),
      semester: 1, // Default
      totalRequiredHours: 60
    });
  }

  // Count total conducted hours from session logs
  const sessions = await SessionLog.find({
    class: classId,
    subject: subjectId,
    teacher: teacherId
  });

  progress.conductedHours = sessions.reduce((sum, s) => sum + s.hoursSpent, 0);
  progress.classesConducted = sessions.length;

  // Update progress metrics
  progress.updateProgress();
  await progress.save();

  return progress;
}

// Helper: generate recommendations
function generateRecommendations(progressRecords) {
  const recommendations = [];

  progressRecords.forEach(p => {
    if (p.complianceStatus === 'behind') {
      recommendations.push({
        type: 'critical',
        subject: p.subject.name,
        message: `Add ${Math.ceil(p.urgencyScore)} extra classes per week to catch up`,
        action: 'increase_slots'
      });
    } else if (p.complianceStatus === 'at_risk') {
      recommendations.push({
        type: 'warning',
        subject: p.subject.name,
        message: `Monitor closely, currently ${p.remainingHours} hours behind schedule`,
        action: 'monitor'
      });
    } else if (p.complianceStatus === 'ahead' && p.urgencyScore < 0.5) {
      recommendations.push({
        type: 'info',
        subject: p.subject.name,
        message: `Consider reducing slots, ahead of schedule`,
        action: 'decrease_slots'
      });
    }
  });

  return recommendations;
}

const progressService = {
  async logSession(body) {
    const {
      classId,
      subjectId,
      teacherId,
      date,
      timeSlot,
      hoursSpent,
      sessionType,
      topicsCovered,
      totalStudents,
      presentStudents,
      teacherNotes,
      difficulty,
      studentEngagement
    } = body;

    // Validate required fields
    if (!classId || !subjectId || !teacherId || !date || !timeSlot || !totalStudents || presentStudents === undefined) {
      throw ApiError.badRequest(
        'Missing required fields: classId, subjectId, teacherId, date, timeSlot, totalStudents, presentStudents'
      );
    }

    // Convert topicsCovered from array of strings to array of objects
    const topicsArray = Array.isArray(topicsCovered)
      ? topicsCovered.map((topic) => {
          // If already an object with topicName, use it
          if (typeof topic === 'object' && topic.topicName) {
            return topic;
          }
          // Otherwise, convert string to object
          return {
            topicName: typeof topic === 'string' ? topic : String(topic),
            isCompleted: true
          };
        })
      : [];

    // Create session log
    const sessionLog = new SessionLog({
      class: classId,
      subject: subjectId,
      teacher: teacherId,
      date: new Date(date),
      timeSlot,
      hoursSpent: hoursSpent || 1,
      sessionType: sessionType || 'theory',
      topicsCovered: topicsArray,
      totalStudents,
      presentStudents,
      teacherNotes,
      difficulty,
      studentEngagement,
      loggedBy: teacherId
    });

    await sessionLog.save();

    // Update teaching progress
    await updateTeachingProgress(classId, subjectId, teacherId);

    return sessionLog;
  },

  async getSubjectProgress(subjectId, classId) {
    // Get teaching progress
    const progress = await TeachingProgress.findOne({
      class: classId,
      subject: subjectId
    })
      .populate('class', 'name code semester section')
      .populate('subject', 'name code')
      .populate('teacher', 'firstName lastName email')
      .lean();

    if (!progress) {
      throw ApiError.notFound('No progress data found for this subject in this class');
    }

    // Get recent sessions
    const recentSessions = await SessionLog.find({
      class: classId,
      subject: subjectId
    })
      .sort({ date: -1 })
      .limit(10)
      .populate('teacher', 'firstName lastName')
      .lean();

    return {
      progress,
      recentSessions,
      statistics: {
        completionPercentage: progress.completionPercentage,
        complianceStatus: progress.complianceStatus,
        urgencyScore: progress.urgencyScore,
        hoursRemaining: progress.remainingHours,
        classesAttendance: progress.attendanceRate
      }
    };
  },

  async getClassProgress(classId) {
    // Get all progress records for this class
    const progressRecords = await TeachingProgress.find({ class: classId })
      .populate('subject', 'name code lectures_per_week')
      .populate('teacher', 'firstName lastName name')
      .sort({ completionPercentage: 1 }) // Sort by completion (lowest first)
      .lean();

    if (progressRecords.length === 0) {
      throw ApiError.notFound('No progress data found for this class. Sessions need to be logged first.');
    }

    // Calculate overall class statistics
    const totalSubjects = progressRecords.length;
    const avgCompletion = progressRecords.reduce((sum, p) => sum + p.completionPercentage, 0) / totalSubjects;

    const statusCount = {
      ahead: progressRecords.filter(p => p.complianceStatus === 'ahead').length,
      on_track: progressRecords.filter(p => p.complianceStatus === 'on_track').length,
      at_risk: progressRecords.filter(p => p.complianceStatus === 'at_risk').length,
      behind: progressRecords.filter(p => p.complianceStatus === 'behind').length
    };

    // Get class details
    const classData = await Class.findById(classId)
      .populate('program', 'name')
      .populate({
        path: 'program',
        populate: {
          path: 'department',
          select: 'name'
        }
      })
      .lean();

    return {
      classInfo: {
        name: classData.name,
        code: classData.code,
        program: classData.program.name,
        department: classData.program.department.name,
        semester: classData.semester,
        section: classData.section
      },
      statistics: {
        totalSubjects,
        averageCompletion: Math.round(avgCompletion),
        statusCount
      },
      subjects: progressRecords.map(p => ({
        id: p._id,
        subjectId: p.subject._id,
        subjectName: p.subject.name,
        subjectCode: p.subject.code,
        teacherName: p.teacher
          ? `${p.teacher.firstName || ''} ${p.teacher.lastName || ''}`.trim() || p.teacher.name || 'Unknown'
          : 'Unknown',
        completionPercentage: p.completionPercentage,
        conductedHours: p.conductedHours,
        totalRequiredHours: p.totalRequiredHours,
        remainingHours: p.remainingHours,
        complianceStatus: p.complianceStatus,
        urgencyScore: p.urgencyScore,
        attendanceRate: p.attendanceRate
      }))
    };
  },

  async getCompliance(classId) {
    const progressRecords = await TeachingProgress.find({ class: classId })
      .populate('subject', 'name code')
      .populate('teacher', 'firstName lastName name')
      .lean();

    if (progressRecords.length === 0) {
      throw ApiError.notFound('No progress data found');
    }

    const getTeacherName = (t) => t
      ? (`${t.firstName || ''} ${t.lastName || ''}`.trim() || t.name || 'Unknown')
      : 'Unknown';

    // Calculate compliance metrics
    const totalRequiredHours = progressRecords.reduce((sum, p) => sum + p.totalRequiredHours, 0);
    const totalConductedHours = progressRecords.reduce((sum, p) => sum + p.conductedHours, 0);
    const overallCompletion = totalRequiredHours > 0
      ? Math.round((totalConductedHours / totalRequiredHours) * 100)
      : 0;

    // Identify subjects needing attention
    const subjectsBehind = progressRecords
      .filter(p => p.complianceStatus === 'behind' || p.complianceStatus === 'at_risk')
      .map(p => ({
        subject: p.subject.name,
        teacher: getTeacherName(p.teacher),
        completion: p.completionPercentage,
        status: p.complianceStatus,
        urgencyScore: p.urgencyScore,
        hoursNeeded: p.remainingHours
      }))
      .sort((a, b) => b.urgencyScore - a.urgencyScore); // Sort by urgency

    // Identify subjects performing well
    const subjectsAhead = progressRecords
      .filter(p => p.complianceStatus === 'ahead')
      .map(p => ({
        subject: p.subject.name,
        teacher: getTeacherName(p.teacher),
        completion: p.completionPercentage
      }));

    return {
      overallCompletion,
      totalRequiredHours,
      totalConductedHours,
      totalRemainingHours: totalRequiredHours - totalConductedHours,
      isCompliant: overallCompletion >= 75, // University requirement example
      subjectsBehind,
      subjectsAhead,
      recommendations: generateRecommendations(progressRecords)
    };
  },

  async getTeacherSessions(teacherId, startDate, endDate) {
    const query = { teacher: teacherId };

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const sessions = await SessionLog.find(query)
      .populate('class', 'name code')
      .populate('subject', 'name code')
      .sort({ date: -1 })
      .lean();

    return {
      totalSessions: sessions.length,
      sessions
    };
  },

  async initialize(classId, body) {
    const { academicYear, semester } = body;

    // Get all subjects assigned to this class
    const assignments = await ClassSubject.find({ class: classId })
      .populate('subject')
      .populate('teacher');

    if (assignments.length === 0) {
      throw ApiError.badRequest('No subjects assigned to this class');
    }

    const created = [];
    const existing = [];

    for (const assignment of assignments) {
      // Check if progress already exists
      const existingProgress = await TeachingProgress.findOne({
        class: classId,
        subject: assignment.subject._id,
        teacher: assignment.teacher._id,
        academicYear,
        semester
      });

      if (existingProgress) {
        existing.push(assignment.subject.name);
        continue;
      }

      // Create new progress record
      const progress = new TeachingProgress({
        class: classId,
        subject: assignment.subject._id,
        teacher: assignment.teacher._id,
        academicYear,
        semester,
        totalRequiredHours: 60, // Default, can be customized
        scheduledHours: assignment.subject.lectures_per_week * 16, // 16 weeks
        complianceStatus: 'on_track'
      });

      progress.updateProgress();
      await progress.save();
      created.push(assignment.subject.name);
    }

    return {
      message: 'Progress tracking initialized',
      created: created.length,
      existing: existing.length,
      details: {
        created,
        existing
      }
    };
  }
};

module.exports = progressService;
