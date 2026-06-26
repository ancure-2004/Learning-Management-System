/**
 * Auth controller — HTTP layer: reads the request, calls the service,
 * shapes the response. No business logic or DB access here.
 */
const asyncHandler = require('../utils/asyncHandler');
const authService = require('../services/auth.service');

exports.register = asyncHandler(async (req, res) => {
  const { token, user } = await authService.register(req.body);
  res.status(201).json({
    message: 'User registered successfully',
    token,
    user,
  });
});

exports.login = asyncHandler(async (req, res) => {
  const { token, user } = await authService.login(req.body);
  res.json({
    message: 'Login successful',
    token,
    user,
  });
});

exports.me = asyncHandler(async (req, res) => {
  res.json({ user: req.user });
});

exports.listUsers = asyncHandler(async (req, res) => {
  const users = await authService.listUsers(req.query);
  res.json({ users });
});

exports.updateUser = asyncHandler(async (req, res) => {
  const user = await authService.updateUser(req.user, req.params.id, req.body);
  res.json({ message: 'User updated successfully', user });
});

exports.changePassword = asyncHandler(async (req, res) => {
  await authService.changePassword(req.user, req.body);
  res.json({ message: 'Password changed successfully' });
});

exports.deactivateUser = asyncHandler(async (req, res) => {
  const user = await authService.deactivateUser(req.params.id);
  res.json({ message: 'User deactivated successfully', user });
});

exports.activateUser = asyncHandler(async (req, res) => {
  const user = await authService.activateUser(req.params.id);
  res.json({ message: 'User activated successfully', user });
});

exports.deleteUser = asyncHandler(async (req, res) => {
  await authService.deleteUser(req.user, req.params.id);
  res.json({ message: 'User deleted successfully' });
});
