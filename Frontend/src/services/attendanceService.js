import client from '@/api/client';

const attendanceService = {
  getByClass: (classId) =>
    client.get(`/attendance/class/${classId}`).then((r) => r.data),
  getClassStudents: (classId) =>
    client.get(`/attendance/class/${classId}/students`).then((r) => r.data),
  getSessions: (params) =>
    client.get('/attendance/sessions', { params }).then((r) => r.data),
  getSessionsByClass: (classId, params) =>
    client.get(`/attendance/sessions/${classId}`, { params }).then((r) => r.data),
  mark: (data) => client.post('/attendance/mark', data).then((r) => r.data),
};

export default attendanceService;
