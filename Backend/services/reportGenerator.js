const Timetable = require('../models/timetable.model');
const ClassSubject = require('../models/classSubject.model');
const Classroom = require('../models/classroom.model');
const Class = require('../models/class.model');
const SessionLog = require('../models/sessionLog.model');
const TeachingProgress = require('../models/teachingProgress.model');
const TeacherRating = require('../models/teacherRating.model');
const User = require('../models/user.model');
const Subject = require('../models/subject.model');

// ─── 1. Timetable Utilization Report ─────────────────────────────────────────
async function generateTimetableUtilizationReport(filters = {}) {
    const query = {};
    if (filters.academicYear) query.academicYear = filters.academicYear;
    if (filters.semester) query.semester = filters.semester;
    if (filters.class) query.class = filters.class;
    query.status = 'published';

    const timetables = await Timetable.find(query)
        .populate('class', 'name code semester');

    const classrooms = await Classroom.find();
    const totalRooms = classrooms.length;
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const totalSlots = 8; // 8 slots per day

    let totalAvailableSlots = 0;
    let totalUsedSlots = 0;
    const dayWiseUtilization = {};
    const slotWiseUtilization = {};
    const classWiseUtilization = [];

    days.forEach(day => {
        dayWiseUtilization[day] = { available: 0, used: 0 };
    });
    for (let i = 0; i < totalSlots; i++) {
        slotWiseUtilization[`Slot ${i + 1}`] = { available: 0, used: 0 };
    }

    for (const tt of timetables) {
        const schedule = tt.schedule;
        if (!schedule) continue;

        let classUsed = 0;
        let classTotal = 0;

        for (const day of days) {
            const daySchedule = schedule[day];
            if (!daySchedule) continue;

            for (let slotIdx = 0; slotIdx < totalSlots; slotIdx++) {
                const slot = daySchedule[slotIdx];
                totalAvailableSlots++;
                classTotal++;
                dayWiseUtilization[day].available++;
                slotWiseUtilization[`Slot ${slotIdx + 1}`].available++;

                if (slot && slot.subject && slot.type !== 'lunch' && slot.type !== 'break') {
                    totalUsedSlots++;
                    classUsed++;
                    dayWiseUtilization[day].used++;
                    slotWiseUtilization[`Slot ${slotIdx + 1}`].used++;
                }
            }
        }

        classWiseUtilization.push({
            className: tt.class?.name || 'Unknown',
            classCode: tt.class?.code || '',
            totalSlots: classTotal,
            usedSlots: classUsed,
            utilizationRate: classTotal > 0 ? Math.round((classUsed / classTotal) * 100) : 0
        });
    }

    const overallUtilization = totalAvailableSlots > 0
        ? Math.round((totalUsedSlots / totalAvailableSlots) * 100)
        : 0;

    // Find peak hours
    const peakHours = Object.entries(slotWiseUtilization)
        .map(([slot, data]) => ({
            slot,
            utilization: data.available > 0 ? Math.round((data.used / data.available) * 100) : 0
        }))
        .sort((a, b) => b.utilization - a.utilization);

    // Day-wise chart data
    const dayChartData = Object.entries(dayWiseUtilization).map(([day, data]) => ({
        day,
        utilization: data.available > 0 ? Math.round((data.used / data.available) * 100) : 0,
        used: data.used,
        available: data.available
    }));

    return {
        data: {
            overallUtilization,
            totalTimetables: timetables.length,
            totalAvailableSlots,
            totalUsedSlots,
            emptySlots: totalAvailableSlots - totalUsedSlots,
            dayChartData,
            slotChartData: peakHours,
            classWiseUtilization: classWiseUtilization.sort((a, b) => b.utilizationRate - a.utilizationRate),
            totalRooms
        },
        summary: {
            totalRecords: timetables.length,
            keyMetrics: {
                overallUtilization: `${overallUtilization}%`,
                peakHour: peakHours[0]?.slot || 'N/A',
                emptySlots: totalAvailableSlots - totalUsedSlots
            }
        }
    };
}

// ─── 2. Teacher Workload Report ──────────────────────────────────────────────
async function generateTeacherWorkloadReport(filters = {}) {
    const csQuery = {};
    if (filters.teacher) csQuery.teacher = filters.teacher;

    const assignments = await ClassSubject.find(csQuery)
        .populate('teacher', 'name')
        .populate('subject', 'name code lectures_per_week')
        .populate('class', 'name code semester');

    // Get timetable data for actual scheduled hours
    const ttQuery = { status: 'published' };
    if (filters.academicYear) ttQuery.academicYear = filters.academicYear;
    if (filters.semester) ttQuery.semester = filters.semester;

    const timetables = await Timetable.find(ttQuery)
        .populate('class', 'name code');

    // Build teacher-wise workload from timetables
    const teacherMap = {};
    const teachers = await User.find({ role: 'teacher' }).select('firstName lastName email');

    for (const teacher of teachers) {
        teacherMap[teacher._id.toString()] = {
            teacherId: teacher._id,
            name: `${teacher.firstName} ${teacher.lastName}`,
            email: teacher.email,
            weeklyHours: 0,
            subjects: new Set(),
            classes: new Set(),
            dailyHours: { Monday: 0, Tuesday: 0, Wednesday: 0, Thursday: 0, Friday: 0 },
            maxConsecutive: 0
        };
    }

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

    for (const tt of timetables) {
        if (!tt.schedule) continue;
        for (const day of days) {
            const daySchedule = tt.schedule[day];
            if (!daySchedule) continue;

            let consecutive = {};

            for (const slot of daySchedule) {
                if (slot && slot.teacher) {
                    const tid = slot.teacher.toString();
                    if (!teacherMap[tid]) continue;

                    teacherMap[tid].weeklyHours++;
                    teacherMap[tid].dailyHours[day]++;
                    if (slot.subject) teacherMap[tid].subjects.add(slot.subjectName || slot.subject.toString());
                    teacherMap[tid].classes.add(tt.class?.name || tt.class?.toString());

                    consecutive[tid] = (consecutive[tid] || 0) + 1;
                    if (consecutive[tid] > teacherMap[tid].maxConsecutive) {
                        teacherMap[tid].maxConsecutive = consecutive[tid];
                    }
                } else {
                    // Reset consecutive counts for all teachers on break/empty
                    consecutive = {};
                }
            }
        }
    }

    // Also count from assignments for teachers not yet in timetables
    for (const a of assignments) {
        if (!a.teacher) continue;
        const tid = a.teacher._id ? a.teacher._id.toString() : a.teacher.toString();
        if (!teacherMap[tid]) {
            teacherMap[tid] = {
                teacherId: tid,
                name: a.teacher.name || 'Unknown',
                weeklyHours: 0,
                subjects: new Set(),
                classes: new Set(),
                dailyHours: { Monday: 0, Tuesday: 0, Wednesday: 0, Thursday: 0, Friday: 0 },
                maxConsecutive: 0
            };
        }
    }

    const workloadData = Object.values(teacherMap)
        .map(t => ({
            ...t,
            subjects: [...t.subjects],
            classes: [...t.classes],
            subjectCount: t.subjects.size || [...t.subjects].length,
            classCount: t.classes.size || [...t.classes].length,
            avgDailyHours: Math.round((t.weeklyHours / 5) * 10) / 10,
            status: t.weeklyHours > 25 ? 'overloaded' :
                t.weeklyHours > 20 ? 'high' :
                    t.weeklyHours >= 15 ? 'normal' : 'light'
        }))
        .filter(t => t.weeklyHours > 0)
        .sort((a, b) => b.weeklyHours - a.weeklyHours);

    const overloaded = workloadData.filter(t => t.status === 'overloaded');
    const avgHours = workloadData.length > 0
        ? Math.round(workloadData.reduce((s, t) => s + t.weeklyHours, 0) / workloadData.length * 10) / 10
        : 0;

    // Distribution for chart
    const distribution = {
        overloaded: workloadData.filter(t => t.status === 'overloaded').length,
        high: workloadData.filter(t => t.status === 'high').length,
        normal: workloadData.filter(t => t.status === 'normal').length,
        light: workloadData.filter(t => t.status === 'light').length
    };

    return {
        data: {
            workloadByTeacher: workloadData,
            overloadedTeachers: overloaded,
            averageHours: avgHours,
            totalTeachers: workloadData.length,
            distribution,
            distributionChartData: [
                { name: 'Overloaded (>25h)', value: distribution.overloaded, color: '#ef4444' },
                { name: 'High (20-25h)', value: distribution.high, color: '#f59e0b' },
                { name: 'Normal (15-20h)', value: distribution.normal, color: '#22c55e' },
                { name: 'Light (<15h)', value: distribution.light, color: '#3b82f6' }
            ]
        },
        summary: {
            totalRecords: workloadData.length,
            keyMetrics: {
                averageHours: avgHours,
                overloadedCount: overloaded.length,
                maxHours: workloadData[0]?.weeklyHours || 0
            }
        }
    };
}

// ─── 3. Room Usage Report ────────────────────────────────────────────────────
async function generateRoomUsageReport(filters = {}) {
    const classrooms = await Classroom.find();

    const ttQuery = { status: 'published' };
    if (filters.academicYear) ttQuery.academicYear = filters.academicYear;
    if (filters.semester) ttQuery.semester = filters.semester;

    const timetables = await Timetable.find(ttQuery);
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const totalSlots = 8;

    // Count room usage from timetables
    const roomUsage = {};
    classrooms.forEach(room => {
        roomUsage[room._id.toString()] = {
            roomId: room._id,
            name: room.name,
            capacity: room.capacity,
            usedSlots: 0,
            totalAvailable: days.length * totalSlots,
            dayWise: {}
        };
        days.forEach(day => {
            roomUsage[room._id.toString()].dayWise[day] = 0;
        });
    });

    for (const tt of timetables) {
        if (!tt.schedule) continue;
        for (const day of days) {
            const daySchedule = tt.schedule[day];
            if (!daySchedule) continue;
            for (const slot of daySchedule) {
                if (slot && slot.classroom) {
                    const rid = slot.classroom.toString();
                    if (roomUsage[rid]) {
                        roomUsage[rid].usedSlots++;
                        roomUsage[rid].dayWise[day]++;
                    }
                }
            }
        }
    }

    const roomData = Object.values(roomUsage).map(r => ({
        ...r,
        utilizationRate: r.totalAvailable > 0
            ? Math.round((r.usedSlots / r.totalAvailable) * 100)
            : 0,
        hoursPerWeek: r.usedSlots
    })).sort((a, b) => b.utilizationRate - a.utilizationRate);

    const overallUtilization = roomData.length > 0
        ? Math.round(roomData.reduce((s, r) => s + r.utilizationRate, 0) / roomData.length)
        : 0;

    const underutilized = roomData.filter(r => r.utilizationRate < 30);

    return {
        data: {
            roomUtilization: roomData,
            overallUtilization,
            totalRooms: classrooms.length,
            underutilizedRooms: underutilized,
            chartData: roomData.map(r => ({
                name: r.name,
                utilization: r.utilizationRate,
                capacity: r.capacity,
                usedSlots: r.usedSlots
            }))
        },
        summary: {
            totalRecords: classrooms.length,
            keyMetrics: {
                overallUtilization: `${overallUtilization}%`,
                underutilizedCount: underutilized.length,
                mostUsed: roomData[0]?.name || 'N/A'
            }
        }
    };
}

// ─── 4. Progress Tracking Report ─────────────────────────────────────────────
async function generateProgressTrackingReport(filters = {}) {
    const query = {};
    if (filters.academicYear) query.academicYear = filters.academicYear;
    if (filters.semester) query.semester = filters.semester;
    if (filters.class) query.class = filters.class;
    if (filters.teacher) query.teacher = filters.teacher;

    const progress = await TeachingProgress.find(query)
        .populate('class', 'name code')
        .populate('subject', 'name code')
        .populate('teacher', 'firstName lastName');

    const completionData = progress.map(p => ({
        id: p._id,
        className: p.class?.name || 'Unknown',
        classCode: p.class?.code || '',
        subjectName: p.subject?.name || 'Unknown',
        subjectCode: p.subject?.code || '',
        teacherName: p.teacher ? `${p.teacher.firstName} ${p.teacher.lastName}` : 'Unknown',
        completionPercentage: p.completionPercentage || 0,
        conductedHours: p.conductedHours || 0,
        totalRequiredHours: p.totalRequiredHours || 60,
        remainingHours: p.remainingHours || 0,
        complianceStatus: p.complianceStatus || 'on_track',
        urgencyScore: p.urgencyScore || 0,
        attendanceRate: p.attendanceRate || 0
    }));

    const behindSchedule = completionData.filter(d => d.complianceStatus === 'behind');
    const atRisk = completionData.filter(d => d.complianceStatus === 'at_risk');
    const onTrack = completionData.filter(d => d.complianceStatus === 'on_track');
    const ahead = completionData.filter(d => d.complianceStatus === 'ahead');

    const avgCompletion = completionData.length > 0
        ? Math.round(completionData.reduce((s, d) => s + d.completionPercentage, 0) / completionData.length)
        : 0;

    const statusDistribution = [
        { name: 'Ahead', value: ahead.length, color: '#22c55e' },
        { name: 'On Track', value: onTrack.length, color: '#3b82f6' },
        { name: 'At Risk', value: atRisk.length, color: '#f59e0b' },
        { name: 'Behind', value: behindSchedule.length, color: '#ef4444' }
    ];

    return {
        data: {
            progressData: completionData.sort((a, b) => a.completionPercentage - b.completionPercentage),
            behindSchedule,
            atRisk,
            onTrack,
            ahead,
            averageCompletion: avgCompletion,
            totalSubjects: completionData.length,
            statusDistribution
        },
        summary: {
            totalRecords: completionData.length,
            keyMetrics: {
                averageCompletion: `${avgCompletion}%`,
                behindCount: behindSchedule.length,
                atRiskCount: atRisk.length
            }
        }
    };
}

// ─── 5. Attendance Analytics Report ──────────────────────────────────────────
async function generateAttendanceReport(filters = {}) {
    const query = {};
    if (filters.class) query.class = filters.class;
    if (filters.teacher) query.teacher = filters.teacher;
    if (filters.subject) query.subject = filters.subject;
    if (filters.dateRange?.start && filters.dateRange?.end) {
        query.date = {
            $gte: new Date(filters.dateRange.start),
            $lte: new Date(filters.dateRange.end)
        };
    }

    const sessions = await SessionLog.find(query)
        .populate('class', 'name code')
        .populate('subject', 'name code')
        .populate('teacher', 'firstName lastName')
        .sort({ date: -1 });

    if (sessions.length === 0) {
        return {
            data: {
                overallAttendance: 0,
                totalSessions: 0,
                byClass: [],
                bySubject: [],
                byDay: [],
                trends: [],
                lowAttendanceSessions: []
            },
            summary: { totalRecords: 0, keyMetrics: { averageAttendance: '0%' } }
        };
    }

    // Overall average
    const overallAttendance = Math.round(
        sessions.reduce((s, sess) => s + (sess.attendancePercentage || 0), 0) / sessions.length
    );

    // By class
    const classMap = {};
    sessions.forEach(s => {
        const key = s.class?._id?.toString() || 'unknown';
        if (!classMap[key]) {
            classMap[key] = { name: s.class?.name || 'Unknown', total: 0, count: 0 };
        }
        classMap[key].total += (s.attendancePercentage || 0);
        classMap[key].count++;
    });
    const byClass = Object.values(classMap).map(c => ({
        name: c.name,
        attendance: Math.round(c.total / c.count),
        sessions: c.count
    })).sort((a, b) => a.attendance - b.attendance);

    // By subject
    const subjectMap = {};
    sessions.forEach(s => {
        const key = s.subject?._id?.toString() || 'unknown';
        if (!subjectMap[key]) {
            subjectMap[key] = { name: s.subject?.name || 'Unknown', total: 0, count: 0 };
        }
        subjectMap[key].total += (s.attendancePercentage || 0);
        subjectMap[key].count++;
    });
    const bySubject = Object.values(subjectMap).map(s => ({
        name: s.name,
        attendance: Math.round(s.total / s.count),
        sessions: s.count
    })).sort((a, b) => a.attendance - b.attendance);

    // By day of week
    const dayMap = { 0: 'Sunday', 1: 'Monday', 2: 'Tuesday', 3: 'Wednesday', 4: 'Thursday', 5: 'Friday', 6: 'Saturday' };
    const dayStats = {};
    sessions.forEach(s => {
        const day = dayMap[new Date(s.date).getDay()];
        if (!dayStats[day]) dayStats[day] = { total: 0, count: 0 };
        dayStats[day].total += (s.attendancePercentage || 0);
        dayStats[day].count++;
    });
    const byDay = Object.entries(dayStats).map(([day, d]) => ({
        day,
        attendance: Math.round(d.total / d.count),
        sessions: d.count
    }));

    // Trends (group by month)
    const monthMap = {};
    sessions.forEach(s => {
        const d = new Date(s.date);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        if (!monthMap[key]) monthMap[key] = { total: 0, count: 0 };
        monthMap[key].total += (s.attendancePercentage || 0);
        monthMap[key].count++;
    });
    const trends = Object.entries(monthMap)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, d]) => ({
            month,
            attendance: Math.round(d.total / d.count),
            sessions: d.count
        }));

    // Low attendance sessions (<75%)
    const lowAttendance = sessions
        .filter(s => (s.attendancePercentage || 0) < 75)
        .slice(0, 20)
        .map(s => ({
            className: s.class?.name || 'Unknown',
            subjectName: s.subject?.name || 'Unknown',
            teacherName: s.teacher ? `${s.teacher.firstName} ${s.teacher.lastName}` : 'Unknown',
            date: s.date,
            attendance: s.attendancePercentage || 0,
            present: s.presentStudents,
            total: s.totalStudents
        }));

    return {
        data: {
            overallAttendance,
            totalSessions: sessions.length,
            byClass,
            bySubject,
            byDay,
            trends,
            lowAttendanceSessions: lowAttendance
        },
        summary: {
            totalRecords: sessions.length,
            keyMetrics: {
                averageAttendance: `${overallAttendance}%`,
                lowAttendanceCount: lowAttendance.length,
                totalSessions: sessions.length
            }
        }
    };
}

// ─── 6. Performance Overview Report ──────────────────────────────────────────
async function generatePerformanceReport(filters = {}) {
    const teacherQuery = { role: 'teacher' };
    const teachers = await User.find(teacherQuery).select('firstName lastName email');

    const results = [];

    for (const teacher of teachers) {
        const tid = teacher._id.toString();

        // Get ratings
        const ratingQuery = { teacher: teacher._id };
        if (filters.academicYear) ratingQuery.academicYear = filters.academicYear;
        if (filters.semester) ratingQuery.semester = filters.semester;

        const ratings = await TeacherRating.find(ratingQuery);
        const avgRating = ratings.length > 0
            ? ratings.reduce((s, r) => s + r.overallRating, 0) / ratings.length
            : 0;

        // Get progress
        const progressQuery = { teacher: teacher._id };
        if (filters.academicYear) progressQuery.academicYear = filters.academicYear;
        if (filters.semester) progressQuery.semester = filters.semester;

        const progress = await TeachingProgress.find(progressQuery);
        const avgCompletion = progress.length > 0
            ? progress.reduce((s, p) => s + p.completionPercentage, 0) / progress.length
            : 0;

        // Get attendance from sessions
        const sessionQuery = { teacher: teacher._id };
        const sessions = await SessionLog.find(sessionQuery);
        const avgAttendance = sessions.length > 0
            ? sessions.reduce((s, sess) => s + (sess.attendancePercentage || 0), 0) / sessions.length
            : 0;

        // Calculate adherence (classes conducted / classes scheduled)
        const adherence = progress.length > 0
            ? progress.reduce((s, p) => {
                if (p.classesScheduled > 0) {
                    return s + (p.classesConducted / p.classesScheduled) * 100;
                }
                return s + 100;
            }, 0) / progress.length
            : 0;

        // Performance Score = (Rating × 0.3) + (Progress × 0.3) + (Attendance × 0.2) + (Adherence × 0.2)
        const ratingNorm = (avgRating / 5) * 100; // Normalize rating to 100
        const performanceScore = Math.round(
            (ratingNorm * 0.3) + (avgCompletion * 0.3) + (avgAttendance * 0.2) + (adherence * 0.2)
        );

        if (ratings.length > 0 || progress.length > 0 || sessions.length > 0) {
            results.push({
                teacherId: teacher._id,
                name: `${teacher.firstName} ${teacher.lastName}`,
                email: teacher.email,
                avgRating: Math.round(avgRating * 100) / 100,
                totalRatings: ratings.length,
                avgCompletion: Math.round(avgCompletion),
                avgAttendance: Math.round(avgAttendance),
                adherence: Math.round(adherence),
                performanceScore,
                subjectsCount: progress.length,
                sessionsCount: sessions.length
            });
        }
    }

    results.sort((a, b) => b.performanceScore - a.performanceScore);

    const avgScore = results.length > 0
        ? Math.round(results.reduce((s, r) => s + r.performanceScore, 0) / results.length)
        : 0;

    return {
        data: {
            performanceData: results,
            totalTeachers: results.length,
            averageScore: avgScore,
            topPerformers: results.slice(0, 5),
            needsImprovement: results.filter(r => r.performanceScore < 50),
            chartData: results.map(r => ({
                name: r.name,
                rating: r.avgRating,
                completion: r.avgCompletion,
                attendance: r.avgAttendance,
                score: r.performanceScore
            }))
        },
        summary: {
            totalRecords: results.length,
            keyMetrics: {
                averageScore: avgScore,
                topPerformer: results[0]?.name || 'N/A',
                lowPerformers: results.filter(r => r.performanceScore < 50).length
            }
        }
    };
}

// ─── Factory function ────────────────────────────────────────────────────────
async function generateReport(reportType, filters = {}) {
    switch (reportType) {
        case 'timetable_utilization':
            return generateTimetableUtilizationReport(filters);
        case 'teacher_workload':
            return generateTeacherWorkloadReport(filters);
        case 'room_usage':
            return generateRoomUsageReport(filters);
        case 'progress_tracking':
            return generateProgressTrackingReport(filters);
        case 'attendance_analytics':
            return generateAttendanceReport(filters);
        case 'performance_overview':
            return generatePerformanceReport(filters);
        default:
            throw new Error(`Unknown report type: ${reportType}`);
    }
}

module.exports = {
    generateReport,
    generateTimetableUtilizationReport,
    generateTeacherWorkloadReport,
    generateRoomUsageReport,
    generateProgressTrackingReport,
    generateAttendanceReport,
    generatePerformanceReport
};
