/**
 * Timetable generation service.
 * ─────────────────────────────────────────────────────────────────────────
 * Centralizes generation logic out of the route layer and — crucially —
 * makes generation CONFLICT-FREE ACROSS CLASSES: a teacher or room booked in
 * one class's timetable is reserved so no other class can use it at the same
 * (day, slot). Single-class generation respects all OTHER existing timetables;
 * "generate all" runs classes sequentially, accumulating reservations.
 * ─────────────────────────────────────────────────────────────────────────
 */
const Class = require('../models/class.model');
const ClassSubject = require('../models/classSubject.model');
const Classroom = require('../models/classroom.model');
const Timetable = require('../models/timetable.model');
const TeachingProgress = require('../models/teachingProgress.model');
const CalendarEvent = require('../models/calendar.model');
const User = require('../models/user.model');
const Teacher = require('../models/teacher.model');
const Subject = require('../models/subject.model');
const Program = require('../models/program.model');
const solverService = require('./solver.service');
const ApiError = require('../utils/ApiError');

// Shared populate chain: class → program → department.
const CLASS_POPULATE = {
  path: 'class',
  select: 'name code semester section',
  populate: {
    path: 'program',
    select: 'name code',
    populate: { path: 'department', select: 'name code' },
  },
};

const DAYS = 5;
const SLOTS = 8;

/* ── Urgency (for adaptive mode) ─────────────────────────────────────────── */
function calculateUrgencyScore(progressData) {
  if (!progressData) return 0.0;
  const { totalRequiredHours, conductedHours } = progressData;
  const remainingHours = totalRequiredHours - conductedHours;
  const today = new Date();
  const semesterStart = new Date(today.getFullYear(), 6, 1); // July 1
  const totalWeeks = 16;
  const elapsedWeeks = Math.floor((today - semesterStart) / (7 * 24 * 60 * 60 * 1000));
  const weeksRemaining = Math.max(1, totalWeeks - elapsedWeeks);
  return Math.max(0, remainingHours / weeksRemaining);
}

/* ── Blocked days from the academic calendar (current week) ──────────────── */
async function getBlockedDaysForCurrentWeek() {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() + diffToMonday);
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 4);
  weekEnd.setHours(23, 59, 59, 999);

  const holidays = await CalendarEvent.find({
    eventType: { $in: ['holiday', 'vacation'] },
    startDate: { $lte: weekEnd },
    endDate: { $gte: weekStart },
  });

  const blocked = new Set();
  holidays.forEach((h) => {
    const hStart = new Date(Math.max(new Date(h.startDate).getTime(), weekStart.getTime()));
    const hEnd = new Date(Math.min(new Date(h.endDate).getTime(), weekEnd.getTime()));
    for (let d = new Date(hStart); d <= hEnd; d.setDate(d.getDate() + 1)) {
      const jsDay = d.getDay();
      if (jsDay >= 1 && jsDay <= 5) blocked.add(jsDay - 1);
    }
  });
  return [...blocked].sort();
}

/* ── Reservation helpers (keyed by teacher / room NAME, matching schedule) ── */
function extractUsage(schedule) {
  const teacher = []; const room = [];
  if (!Array.isArray(schedule)) return { teacher, room };
  schedule.forEach((day, d) => {
    if (!Array.isArray(day)) return;
    day.forEach((entries, sl) => {
      if (!Array.isArray(entries)) return;
      entries.forEach((e) => {
        if (!e || e.event) return;
        if (e.teacher) teacher.push({ name: e.teacher, day: d, slot: sl });
        if (e.classroom) room.push({ name: e.classroom, day: d, slot: sl });
      });
    });
  });
  return { teacher, room };
}

function makeReservation() {
  return { teacherSet: new Set(), roomSet: new Set() };
}

function addUsageToReservation(reservation, schedule) {
  const { teacher, room } = extractUsage(schedule);
  teacher.forEach((s) => reservation.teacherSet.add(`${s.name}|${s.day}|${s.slot}`));
  room.forEach((s) => reservation.roomSet.add(`${s.name}|${s.day}|${s.slot}`));
}

function reservationToSlots(set) {
  return [...set].map((k) => {
    const i = k.lastIndexOf('|');
    const j = k.lastIndexOf('|', i - 1);
    return { name: k.slice(0, j), day: Number(k.slice(j + 1, i)), slot: Number(k.slice(i + 1)) };
  });
}

/** Build reservations from all existing timetables except the given class. */
async function buildReservationsExcludingClass(excludeClassId) {
  const others = await Timetable.find({
    class: { $ne: excludeClassId },
    status: { $in: ['published', 'draft'] },
  }).select('schedule');
  const reservation = makeReservation();
  others.forEach((tt) => addUsageToReservation(reservation, tt.schedule));
  return reservation;
}

/* ── Build the solver payload for one class ──────────────────────────────── */
async function buildPayload(classId, { adaptiveMode = false } = {}, reservation = makeReservation()) {
  const classData = await Class.findById(classId)
    .populate('program', 'name code')
    .populate('assignedRoom', 'name capacity');
  if (!classData) throw ApiError.notFound('Class not found');

  const assignments = await ClassSubject.find({ class: classId })
    .populate('subject', 'name code lectures_per_week subjectType')
    .populate('teacher', 'name')
    .populate('preferredRoom', 'name capacity');
  if (assignments.length === 0) {
    throw ApiError.badRequest('No subjects assigned to this class. Assign subjects and teachers first.');
  }

  const allClassrooms = await Classroom.find();

  // Adaptive: pull progress → urgency
  const progressMap = new Map();
  if (adaptiveMode) {
    const records = await TeachingProgress.find({ class: classId }).populate('subject', 'name code');
    records.forEach((p) => {
      progressMap.set(p.subject._id.toString(), {
        totalRequiredHours: p.totalRequiredHours,
        conductedHours: p.conductedHours,
        urgencyScore: p.urgencyScore,
      });
    });
  }

  const subjectTeacherPairs = assignments.map((a) => {
    const pd = progressMap.get(a.subject._id.toString());
    const urgency = adaptiveMode && pd ? (pd.urgencyScore || calculateUrgencyScore(pd)) : 0.0;
    return {
      subject: { name: a.subject.name, code: a.subject.code, lectures_per_week: a.subject.lectures_per_week, urgency_score: urgency },
      teacher: { name: a.teacher.name },
    };
  });

  const classrooms = classData.assignedRoom
    ? [{ name: classData.assignedRoom.name, capacity: classData.assignedRoom.capacity }]
    : allClassrooms.map((c) => ({ name: c.name, capacity: c.capacity }));

  const blockedDays = await getBlockedDaysForCurrentWeek();

  // Only pass reservations relevant to THIS class (its teachers / its rooms).
  const teacherNames = new Set(subjectTeacherPairs.map((p) => p.teacher.name));
  const roomNames = new Set(classrooms.map((c) => c.name));
  const reservedTeacherSlots = reservationToSlots(reservation.teacherSet).filter((s) => teacherNames.has(s.name));
  const reservedRoomSlots = reservationToSlots(reservation.roomSet).filter((s) => roomNames.has(s.name));

  return {
    classData,
    payload: {
      subject_teacher_pairs: subjectTeacherPairs,
      classrooms,
      adaptive_mode: adaptiveMode,
      blocked_days: blockedDays,
      reserved_teacher_slots: reservedTeacherSlots,
      reserved_room_slots: reservedRoomSlots,
    },
  };
}

async function saveTimetable(classData, solverData, { academicYear, adaptiveMode, userId }) {
  const tt = new Timetable({
    class: classData._id,
    academicYear: academicYear || new Date().getFullYear().toString(),
    semester: classData.semester,
    schedule: solverData.timetable,
    generatedBy: userId || null,
    status: 'draft',
    metadata: {
      adaptiveMode,
      allocationSummary: solverData.allocation_summary || null,
      statistics: solverData.statistics || null,
    },
  });
  await tt.save();
  return tt;
}

/**
 * Generate one class's timetable, conflict-free against all OTHER existing
 * timetables. Returns the saved Timetable doc + raw solver data.
 */
async function generateForClass(classId, { academicYear, adaptiveMode = false, userId } = {}) {
  const reservation = await buildReservationsExcludingClass(classId);
  const { classData, payload } = await buildPayload(classId, { adaptiveMode }, reservation);
  const solverData = await solverService.generate(payload);
  if (solverData.status !== 'success') {
    throw ApiError.badRequest(solverData.message || 'Could not generate a valid timetable', solverData.details);
  }
  const timetable = await saveTimetable(classData, solverData, { academicYear, adaptiveMode, userId });
  return { timetable, solverData, classData };
}

/**
 * Generate timetables for many classes SEQUENTIALLY, accumulating reservations
 * so the whole institution stays conflict-free. Pre-seeds reservations from
 * timetables of classes NOT in the batch. Never throws on a single class's
 * infeasibility — records it in the summary and continues.
 */
async function generateAll({ classIds, academicYear, adaptiveMode = false, userId } = {}) {
  const targetClasses = classIds && classIds.length
    ? await Class.find({ _id: { $in: classIds } }).select('_id name code')
    : await Class.find().select('_id name code');

  const targetIdSet = new Set(targetClasses.map((c) => c._id.toString()));

  // Seed reservations from timetables of classes OUTSIDE this batch.
  const outside = await Timetable.find({
    class: { $nin: [...targetIdSet] },
    status: { $in: ['published', 'draft'] },
  }).select('schedule');
  const reservation = makeReservation();
  outside.forEach((tt) => addUsageToReservation(reservation, tt.schedule));

  const results = [];
  for (const cls of targetClasses) {
    try {
      const { classData, payload } = await buildPayload(cls._id, { adaptiveMode }, reservation);
      const solverData = await solverService.generate(payload);
      if (solverData.status !== 'success') {
        results.push({ classId: cls._id, className: cls.name, status: 'error', message: solverData.message || 'Infeasible' });
        continue;
      }
      const timetable = await saveTimetable(classData, solverData, { academicYear, adaptiveMode, userId });
      // Reserve this class's teacher/room usage for subsequent classes.
      addUsageToReservation(reservation, solverData.timetable);
      results.push({ classId: cls._id, className: cls.name, status: 'success', timetableId: timetable._id });
    } catch (err) {
      results.push({ classId: cls._id, className: cls.name, status: 'error', message: err.message });
    }
  }

  return {
    total: results.length,
    succeeded: results.filter((r) => r.status === 'success').length,
    failed: results.filter((r) => r.status === 'error').length,
    results,
  };
}

/* ── Query / CRUD methods (moved out of the route layer) ─────────────────── */

/**
 * List all timetables, newest first.
 * Backward-compatible: returns a plain array UNLESS pagination is requested
 * (page/limit), in which case returns { data, total, page, limit, totalPages }.
 */
async function list({ page, limit } = {}) {
  const wantsPage = page !== undefined || limit !== undefined;
  const query = Timetable.find()
    .populate(CLASS_POPULATE)
    .populate('generatedBy', 'firstName lastName email')
    .sort({ createdAt: -1 })
    .lean();

  if (!wantsPage) return query;

  const p = Math.max(1, Number(page) || 1);
  const l = Math.min(100, Math.max(1, Number(limit) || 20));
  const [data, total] = await Promise.all([
    query.skip((p - 1) * l).limit(l),
    Timetable.countDocuments(),
  ]);
  return { data, total, page: p, limit: l, totalPages: Math.ceil(total / l) };
}

/** Get a single timetable by id. */
async function getById(id) {
  const timetable = await Timetable.findById(id)
    .populate(CLASS_POPULATE)
    .populate('generatedBy', 'firstName lastName email')
    .lean();
  if (!timetable) throw ApiError.notFound('Timetable not found');
  return timetable;
}

/** Get all timetables for a specific class, newest first. */
function getByClass(classId) {
  return Timetable.find({ class: classId })
    .populate(CLASS_POPULATE)
    .populate('generatedBy', 'firstName lastName email')
    .sort({ createdAt: -1 })
    .lean();
}

/** Get a teacher's combined schedule (all classes they teach, published). */
async function getForTeacher(teacherUserId) {
  const teacherUser = await User.findById(teacherUserId);
  if (!teacherUser) throw ApiError.notFound('Teacher not found');

  const teacherFullName = `${teacherUser.firstName} ${teacherUser.lastName}`;
  const teacherRecord = await Teacher.findOne({ name: teacherFullName });

  if (!teacherRecord) {
    return {
      teacher: teacherUserId,
      classes: [],
      timetables: [],
      message: 'No classes assigned to this teacher',
    };
  }

  const assignments = await ClassSubject.find({ teacher: teacherRecord._id })
    .populate('class', '_id name code semester section')
    .populate('subject', 'name code');

  if (assignments.length === 0) {
    return {
      teacher: teacherUserId,
      classes: [],
      timetables: [],
      message: 'No classes assigned to this teacher',
    };
  }

  const classIds = assignments.map((a) => a.class._id);
  const timetables = await Timetable.find({
    class: { $in: classIds },
    status: 'published',
  }).populate(CLASS_POPULATE).lean();

  return {
    teacherId: teacherUserId,
    classes: assignments.map((a) => ({ class: a.class, subject: a.subject })),
    timetables,
  };
}

/** Get a student's class timetable (published). */
async function getForStudent(studentUserId) {
  const student = await User.findById(studentUserId);
  if (!student) throw ApiError.notFound('Student not found');
  if (student.role !== 'student') throw ApiError.badRequest('User is not a student');

  const program = await Program.findOne({ code: student.program });
  console.log(program);

  if (!program) {
    throw ApiError.notFound('Program not found for this student', `No program found matching: ${student.program}`);
  }

  const studentClass = await Class.findOne({
    program: program._id,
    semester: student.semester,
    section: student.section,
  });

  if (!studentClass) {
    throw ApiError.notFound('Program not found for this student', {
      program: student.program,
      semester: student.semester,
      section: student.section,
      programId: program._id.toString(),
      programName: program.name,
    });
  }

  const timetable = await Timetable.findOne({
    class: studentClass._id,
    status: 'published',
  })
    .populate(CLASS_POPULATE)
    .sort({ createdAt: -1 })
    .lean();

  if (!timetable) {
    throw ApiError.notFound('No published timetable found for your class');
  }

  return { studentId: studentUserId, class: timetable.class, timetable };
}

/** Publish a timetable (draft → published). */
async function publish(id) {
  const timetable = await Timetable.findByIdAndUpdate(
    id,
    { status: 'published' },
    { new: true }
  ).populate(CLASS_POPULATE);
  if (!timetable) throw ApiError.notFound('Timetable not found');
  return timetable;
}

/** Delete a timetable. */
async function remove(id) {
  const timetable = await Timetable.findByIdAndDelete(id);
  if (!timetable) throw ApiError.notFound('Timetable not found');
  return timetable;
}

/** Validate a proposed slot change for conflicts. Returns { valid, conflicts, message? }. */
async function validateSlot(id, body) {
  const { day, slot, proposedData } = body;

  const timetable = await Timetable.findById(id).populate('class', '_id name semester');
  if (!timetable) throw ApiError.notFound('Timetable not found');

  const conflicts = [];

  // If it's a free slot or event, no conflict checking needed
  if (!proposedData.subject || !proposedData.teacher) {
    return { valid: true, conflicts: [] };
  }

  // Check 1: Lunch break (slot 4 = 13:00-14:00)
  if (slot === 4) {
    conflicts.push({
      type: 'lunch_break',
      message: 'Slot 4 (13:00-14:00) is reserved for lunch break',
    });
  }

  // Check 2 & 3: Teacher / room availability against other timetables
  const otherTimetables = await Timetable.find({
    _id: { $ne: id },
    status: { $in: ['published', 'draft'] },
  }).populate('class', 'name code');

  for (const tt of otherTimetables) {
    const slotContent = tt.schedule[day]?.[slot];
    if (slotContent && slotContent.length > 0) {
      for (const entry of slotContent) {
        if (entry.teacher === proposedData.teacher && !entry.event) {
          conflicts.push({
            type: 'teacher_clash',
            message: `${proposedData.teacher} is already teaching ${entry.subject} in ${tt.class.name} at this time`,
            conflictingClass: tt.class.name,
          });
        }
      }
    }
  }

  for (const tt of otherTimetables) {
    const slotContent = tt.schedule[day]?.[slot];
    if (slotContent && slotContent.length > 0) {
      for (const entry of slotContent) {
        if (entry.classroom === proposedData.classroom && !entry.event) {
          conflicts.push({
            type: 'room_clash',
            message: `${proposedData.classroom} is already booked for ${entry.subject} (${tt.class.name}) at this time`,
            conflictingClass: tt.class.name,
          });
        }
      }
    }
  }

  // Check 4: Teacher cooldown — consecutive classes in the current timetable
  let consecutiveCount = 0;
  const daySchedule = timetable.schedule[day];

  for (let i = slot - 1; i >= 0; i--) {
    const slotContent = daySchedule[i];
    if (slotContent && slotContent.length > 0) {
      const hasTeacher = slotContent.some((entry) => entry.teacher === proposedData.teacher);
      if (hasTeacher) consecutiveCount++;
      else break;
    } else {
      break;
    }
  }

  for (let i = slot + 1; i < daySchedule.length; i++) {
    const slotContent = daySchedule[i];
    if (slotContent && slotContent.length > 0) {
      const hasTeacher = slotContent.some((entry) => entry.teacher === proposedData.teacher);
      if (hasTeacher) consecutiveCount++;
      else break;
    } else {
      break;
    }
  }

  if (consecutiveCount >= 2) {
    conflicts.push({
      type: 'teacher_cooldown_warning',
      message: `${proposedData.teacher} will have ${consecutiveCount + 1} consecutive classes. Consider adding a break.`,
      severity: 'warning',
    });
  }

  // Check 5: Verify subject-teacher mapping
  const classId = timetable.class._id;
  const subject = await Subject.findOne({ name: proposedData.subject });
  const teacher = await Teacher.findOne({ name: proposedData.teacher });

  if (subject && teacher) {
    const assignment = await ClassSubject.findOne({
      class: classId,
      subject: subject._id,
      teacher: teacher._id,
    });

    if (!assignment) {
      conflicts.push({
        type: 'invalid_teacher',
        message: `${proposedData.teacher} is not assigned to teach ${proposedData.subject} for this class`,
      });
    }
  }

  const valid = conflicts.filter((c) => c.severity !== 'warning').length === 0;

  return {
    valid,
    conflicts,
    message: valid ? 'No conflicts detected' : 'Conflicts detected',
  };
}

/** Save an edited timetable, snapshotting the current version to history. */
async function saveEdit(id, body, userId) {
  const { schedule, changes } = body;

  const timetable = await Timetable.findById(id);
  if (!timetable) throw ApiError.notFound('Timetable not found');

  if (!timetable.editHistory) timetable.editHistory = [];

  timetable.editHistory.push({
    versionNumber: timetable.currentVersion || 1,
    timestamp: new Date(),
    editedBy: userId,
    changeDescription: changes || 'Manual edit',
    scheduleSnapshot: JSON.parse(JSON.stringify(timetable.schedule)),
  });

  timetable.schedule = schedule;
  timetable.isEdited = true;
  timetable.lastEditedAt = new Date();
  timetable.lastEditedBy = userId;
  timetable.currentVersion = (timetable.currentVersion || 1) + 1;

  await timetable.save();

  return Timetable.findById(id)
    .populate(CLASS_POPULATE)
    .populate('generatedBy', 'firstName lastName email')
    .populate('lastEditedBy', 'firstName lastName email');
}

/** Get edit history for a timetable. Returns { currentVersion, history }. */
async function getHistory(id) {
  const timetable = await Timetable.findById(id)
    .populate('editHistory.editedBy', 'firstName lastName email')
    .lean();
  if (!timetable) throw ApiError.notFound('Timetable not found');
  return {
    currentVersion: timetable.currentVersion || 1,
    history: timetable.editHistory || [],
  };
}

/** Revert a timetable to a specific version. */
async function revert(id, versionNumber, userId) {
  const timetable = await Timetable.findById(id);
  if (!timetable) throw ApiError.notFound('Timetable not found');

  const version = timetable.editHistory?.find(
    (h) => h.versionNumber === parseInt(versionNumber)
  );
  if (!version) throw ApiError.notFound('Version not found');

  timetable.editHistory.push({
    versionNumber: timetable.currentVersion || 1,
    timestamp: new Date(),
    editedBy: userId,
    changeDescription: `Reverted to version ${versionNumber}`,
    scheduleSnapshot: JSON.parse(JSON.stringify(timetable.schedule)),
  });

  timetable.schedule = version.scheduleSnapshot;
  timetable.currentVersion = (timetable.currentVersion || 1) + 1;
  timetable.lastEditedAt = new Date();
  timetable.lastEditedBy = userId;

  await timetable.save();

  return Timetable.findById(id).populate(CLASS_POPULATE);
}

module.exports = {
  generateForClass,
  generateAll,
  buildReservationsExcludingClass,
  extractUsage,
  list,
  getById,
  getByClass,
  getForTeacher,
  getForStudent,
  publish,
  remove,
  validateSlot,
  saveEdit,
  getHistory,
  revert,
};
