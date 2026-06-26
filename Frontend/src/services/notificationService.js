import client from '@/api/client';

const notificationService = {
  getAll: (params) => client.get('/notifications', { params }).then((r) => r.data),
  getUnreadCount: () =>
    client.get('/notifications/unread-count').then((r) => r.data),
  markRead: (id) =>
    client.put(`/notifications/${id}/read`).then((r) => r.data),
  markAllRead: () =>
    client.put('/notifications/read-all').then((r) => r.data),
  remove: (id) => client.delete(`/notifications/${id}`).then((r) => r.data),
};

export default notificationService;
