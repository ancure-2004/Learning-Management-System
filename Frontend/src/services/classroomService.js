import client from '@/api/client';

const classroomService = {
  getAll: () => client.get('/classrooms').then((r) => r.data),
  getOne: (id) => client.get(`/classrooms/${id}`).then((r) => r.data),
  create: (data) => client.post('/classrooms/add', data).then((r) => r.data),
  update: (id, data) => client.put(`/classrooms/${id}`, data).then((r) => r.data),
  remove: (id) => client.delete(`/classrooms/${id}`).then((r) => r.data),
};

export default classroomService;
