import client from '@/api/client';

const departmentService = {
  getAll: () => client.get('/departments').then((r) => r.data),
  getOne: (id) => client.get(`/departments/${id}`).then((r) => r.data),
  create: (data) => client.post('/departments/add', data).then((r) => r.data),
  update: (id, data) =>
    client.put(`/departments/${id}`, data).then((r) => r.data),
  remove: (id) => client.delete(`/departments/${id}`).then((r) => r.data),
};

export default departmentService;
