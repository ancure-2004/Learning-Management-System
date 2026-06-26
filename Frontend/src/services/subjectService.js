import client from '@/api/client';

const subjectService = {
  getAll: () => client.get('/subjects').then((r) => r.data),
  getOne: (id) => client.get(`/subjects/${id}`).then((r) => r.data),
  create: (data) => client.post('/subjects/add', data).then((r) => r.data),
  update: (id, data) => client.put(`/subjects/${id}`, data).then((r) => r.data),
  remove: (id) => client.delete(`/subjects/${id}`).then((r) => r.data),
};

export default subjectService;
