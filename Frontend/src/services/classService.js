import client from '@/api/client';

const classService = {
  getAll: () => client.get('/classes').then((r) => r.data),
  getOne: (id) => client.get(`/classes/${id}`).then((r) => r.data),
  create: (data) => client.post('/classes/add', data).then((r) => r.data),
  update: (id, data) => client.put(`/classes/${id}`, data).then((r) => r.data),
  remove: (id) => client.delete(`/classes/${id}`).then((r) => r.data),
};

export default classService;
