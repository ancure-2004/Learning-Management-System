import client from '@/api/client';

const teacherService = {
  getAll: () => client.get('/teachers').then((r) => r.data),
  getOne: (id) => client.get(`/teachers/${id}`).then((r) => r.data),
  getByName: (name) =>
    client.get(`/teachers/by-name/${encodeURIComponent(name)}`).then((r) => r.data),
  getByUser: (userId) => client.get(`/teachers/user/${userId}`).then((r) => r.data),
  create: (data) => client.post('/teachers/add', data).then((r) => r.data),
  update: (id, data) => client.put(`/teachers/${id}`, data).then((r) => r.data),
  remove: (id) => client.delete(`/teachers/${id}`).then((r) => r.data),
};

export default teacherService;
