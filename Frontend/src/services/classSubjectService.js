import client from '@/api/client';

const classSubjectService = {
  getAll: () => client.get('/class-subjects').then((r) => r.data),
  getByClass: (classId) =>
    client.get(`/class-subjects/class/${classId}`).then((r) => r.data),
  getByTeacher: (teacherId) =>
    client.get(`/class-subjects/teacher/${teacherId}`).then((r) => r.data),
  getTeacherByName: (firstName, lastName) =>
    client
      .get(`/class-subjects/teacher-by-name/${firstName}/${lastName}`)
      .then((r) => r.data),
  create: (data) => client.post('/class-subjects/add', data).then((r) => r.data),
  update: (id, data) =>
    client.put(`/class-subjects/${id}`, data).then((r) => r.data),
  remove: (id) => client.delete(`/class-subjects/${id}`).then((r) => r.data),
};

export default classSubjectService;
