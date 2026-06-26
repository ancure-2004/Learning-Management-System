import client from '@/api/client';

const leaveService = {
  getAll: (params) => client.get('/leave', { params }).then((r) => r.data),
  getMine: () => client.get('/leave/my').then((r) => r.data),
  getPending: () => client.get('/leave/pending').then((r) => r.data),
  apply: (data) => client.post('/leave', data).then((r) => r.data),
  update: (id, data) => client.put(`/leave/${id}`, data).then((r) => r.data),
  remove: (id) => client.delete(`/leave/${id}`).then((r) => r.data),
  approve: (id, data) => client.put(`/leave/${id}/approve`, data).then((r) => r.data),
  reject: (id, data) => client.put(`/leave/${id}/reject`, data).then((r) => r.data),
};

export default leaveService;
