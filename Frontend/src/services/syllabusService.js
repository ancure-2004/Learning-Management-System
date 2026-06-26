import client from '@/api/client';

const syllabusService = {
  getByYear: (academicYear) =>
    client.get(`/syllabus/year/${academicYear}`).then((r) => r.data),
  create: (data) => client.post('/syllabus/create', data).then((r) => r.data),
  update: (id, data) => client.put(`/syllabus/${id}`, data).then((r) => r.data),
  remove: (id) => client.delete(`/syllabus/${id}`).then((r) => r.data),
};

export default syllabusService;
