import client from '@/api/client';

const authService = {
  login: (email, password) =>
    client.post('/auth/login', { email, password }).then((r) => r.data),

  register: (userData) =>
    client.post('/auth/register', userData).then((r) => r.data),

  me: () => client.get('/auth/me').then((r) => r.data),

  getUsers: () => client.get('/auth/users').then((r) => r.data),

  getUser: (id) => client.get(`/auth/users/${id}`).then((r) => r.data),

  updateUser: (id, data) =>
    client.put(`/auth/users/${id}`, data).then((r) => r.data),

  deleteUser: (id) => client.delete(`/auth/users/${id}`).then((r) => r.data),

  activateUser: (id) =>
    client.put(`/auth/users/${id}/activate`).then((r) => r.data),
  deactivateUser: (id) =>
    client.put(`/auth/users/${id}/deactivate`).then((r) => r.data),
};

export default authService;
