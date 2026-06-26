import client from '@/api/client';

const ratingService = {
  submit: (data) => client.post('/ratings/submit', data).then((r) => r.data),
  getMyTeachers: (userId, params) =>
    client.get(`/ratings/my-teachers/${userId}`, { params }).then((r) => r.data),
  getForTeacher: (teacherId, params) =>
    client.get(`/ratings/teacher/${teacherId}`, { params }).then((r) => r.data),
  getAggregate: (teacherId) =>
    client.get(`/ratings/aggregate/${teacherId}`).then((r) => r.data),
  getTrends: (teacherId, params) =>
    client.get(`/ratings/trends/${teacherId}`, { params }).then((r) => r.data),
};

export default ratingService;
