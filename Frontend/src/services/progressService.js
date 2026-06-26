import client from '@/api/client';

const progressService = {
  getByClass: (classId) =>
    client.get(`/progress/class/${classId}`).then((r) => r.data),
  logSession: (data) =>
    client.post('/progress/log-session', data).then((r) => r.data),
};

export default progressService;
