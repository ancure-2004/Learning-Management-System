import client from '@/api/client';

const programService = {
  getAll: () => client.get('/programs').then((r) => r.data),
  getOne: (id) => client.get(`/programs/${id}`).then((r) => r.data),
  create: (data) => client.post('/programs/add', data).then((r) => r.data),
  update: (id, data) => client.put(`/programs/${id}`, data).then((r) => r.data),
  remove: (id) => client.delete(`/programs/${id}`).then((r) => r.data),
};

export default programService;
