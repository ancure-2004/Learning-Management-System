import client from '@/api/client';

const reportService = {
  list: (params) => client.get('/reports/list', { params }).then((r) => r.data),
  // Compliance trend series for the dashboard chart (planned /metrics feature;
  // 404s gracefully on backends that don't implement it yet).
  complianceTrend: () => client.get('/reports/compliance-trend').then((r) => r.data),
  generate: (data) => client.post('/reports/generate', data).then((r) => r.data),
  getOne: (id) => client.get(`/reports/${id}`).then((r) => r.data),
  remove: (id) => client.delete(`/reports/${id}`).then((r) => r.data),
  export: (id, fmt) =>
    client.get(`/reports/${id}/export/${fmt}`, { responseType: 'blob' }).then((r) => r.data),
};

export default reportService;
