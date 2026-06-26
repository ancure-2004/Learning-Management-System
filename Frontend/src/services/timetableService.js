import client from '@/api/client';

const timetableService = {
  getAll: () => client.get('/timetables').then((r) => r.data),
  getOne: (id) => client.get(`/timetables/${id}`).then((r) => r.data),
  getByClass: (classId) =>
    client.get(`/timetables/class/${classId}`).then((r) => r.data),
  getForTeacher: (userId) =>
    client.get(`/timetables/teacher/${userId}`).then((r) => r.data),
  getForStudent: (userId) =>
    client.get(`/timetables/student/${userId}`).then((r) => r.data),

  generate: (classId, payload) =>
    client.post(`/timetables/generate/${classId}`, payload).then((r) => r.data),

  // Conflict-free generation across all (or selected) classes in one run.
  generateAll: (payload) =>
    client.post('/timetables/generate-all', payload).then((r) => r.data),

  publish: (id) => client.put(`/timetables/${id}/publish`).then((r) => r.data),
  remove: (id) => client.delete(`/timetables/${id}`).then((r) => r.data),

  validateSlot: (id, payload) =>
    client.post(`/timetables/${id}/validate-slot`, payload).then((r) => r.data),
  saveEdit: (id, payload) =>
    client.put(`/timetables/${id}/edit`, payload).then((r) => r.data),
  getHistory: (id) =>
    client.get(`/timetables/${id}/history`).then((r) => r.data),
  revert: (id, versionNumber, payload) =>
    client
      .post(`/timetables/${id}/revert/${versionNumber}`, payload)
      .then((r) => r.data),
};

export default timetableService;
