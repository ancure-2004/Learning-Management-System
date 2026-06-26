import client from '@/api/client';

const calendarService = {
  getAll: (params) => client.get('/calendar', { params }).then((r) => r.data),
  create: (data) => client.post('/calendar', data).then((r) => r.data),
  update: (id, data) => client.put(`/calendar/${id}`, data).then((r) => r.data),
  remove: (id) => client.delete(`/calendar/${id}`).then((r) => r.data),
};

export default calendarService;
