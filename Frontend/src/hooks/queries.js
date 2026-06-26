/**
 * React Query hooks over the services layer.
 * Components call these instead of fetching in useEffect — they get
 * caching, dedup, background refetch, and shared loading/error state for free.
 *
 * Query keys are namespaced by entity so mutations can invalidate precisely.
 */
import { useQuery } from '@tanstack/react-query';
import {
  authService,
  classService,
  subjectService,
  teacherService,
  classroomService,
  departmentService,
  programService,
  classSubjectService,
  timetableService,
  calendarService,
} from '@/services';

// ── Reference data (fetched across many pages → biggest cache win) ────────
export const useClasses = () =>
  useQuery({ queryKey: ['classes'], queryFn: classService.getAll, staleTime: 5 * 60_000 });

export const useSubjects = () =>
  useQuery({ queryKey: ['subjects'], queryFn: subjectService.getAll, staleTime: 5 * 60_000 });

export const useTeachers = () =>
  useQuery({ queryKey: ['teachers'], queryFn: teacherService.getAll, staleTime: 5 * 60_000 });

export const useTeacherByUser = (userId) =>
  useQuery({
    queryKey: ['teachers', 'user', userId],
    queryFn: () => teacherService.getByUser(userId),
    enabled: !!userId,
    retry: false,
  });

export const useClassrooms = () =>
  useQuery({ queryKey: ['classrooms'], queryFn: classroomService.getAll, staleTime: 5 * 60_000 });

export const useDepartments = () =>
  useQuery({ queryKey: ['departments'], queryFn: departmentService.getAll, staleTime: 5 * 60_000 });

export const usePrograms = () =>
  useQuery({ queryKey: ['programs'], queryFn: programService.getAll, staleTime: 5 * 60_000 });

// authService.getUsers() resolves to { users: [...] } — unwrap to the array.
export const useUsers = () =>
  useQuery({
    queryKey: ['users'],
    queryFn: authService.getUsers,
    select: (data) => data?.users || [],
  });

export const useClassSubjects = (classId) =>
  useQuery({
    queryKey: ['classSubjects', 'class', classId],
    queryFn: () => classSubjectService.getByClass(classId),
    enabled: !!classId,
  });

export const useClassSubjectsByTeacher = (teacherId) =>
  useQuery({
    queryKey: ['classSubjects', 'teacher', teacherId],
    queryFn: () => classSubjectService.getByTeacher(teacherId),
    enabled: !!teacherId,
  });

// ── Timetables ────────────────────────────────────────────────────────────
export const useTimetables = () =>
  useQuery({ queryKey: ['timetables'], queryFn: timetableService.getAll });

export const useTimetable = (id) =>
  useQuery({
    queryKey: ['timetable', id],
    queryFn: () => timetableService.getOne(id),
    enabled: !!id,
  });

export const useStudentTimetable = (userId) =>
  useQuery({
    queryKey: ['timetable', 'student', userId],
    queryFn: () => timetableService.getForStudent(userId),
    // The endpoint wraps the doc as { studentId, class, timetable }.
    // Unwrap to the timetable doc so consumers read .schedule/.semester/.class directly.
    select: (data) => data?.timetable ?? null,
    enabled: !!userId,
  });

export const useTeacherTimetable = (userId) =>
  useQuery({
    queryKey: ['timetable', 'teacher', userId],
    queryFn: () => timetableService.getForTeacher(userId),
    enabled: !!userId,
  });

// ── Calendar ────────────────────────────────────────────────────────────
export const useCalendar = (params) =>
  useQuery({
    queryKey: ['calendar', params || null],
    queryFn: () => calendarService.getAll(params),
  });
