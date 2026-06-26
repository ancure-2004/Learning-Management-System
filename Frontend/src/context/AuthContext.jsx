import React, { createContext, useState, useContext, useEffect, useCallback, useMemo } from 'react';
import authService from '@/services/authService';

const AuthContext = createContext(null);
export { AuthContext };

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('preview_user');
    localStorage.removeItem('demo_user');
    setToken(null);
    setUser(null);
  }, []);

  const fetchCurrentUser = useCallback(async () => {
    try {
      const data = await authService.me();
      setUser(data.user);
    } catch (error) {
      console.error('Failed to fetch user:', error.message);
      logout();
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    fetchCurrentUser();
  }, [token, fetchCurrentUser]);

  // Respond to 401s surfaced by the api client. The network layer no longer
  // navigates directly; it dispatches this event so AuthContext stays the
  // single source of truth for session state (and ProtectedRoute handles the
  // in-SPA redirect once `user` becomes null — no full-page reload).
  useEffect(() => {
    const onUnauthorized = () => logout();
    window.addEventListener('auth:unauthorized', onUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', onUnauthorized);
  }, [logout]);

  const login = useCallback(async (email, password) => {
    try {
      const { token: newToken, user: userData } = await authService.login(email, password);
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message || 'Login failed' };
    }
  }, []);

  const register = useCallback(async (userData) => {
    try {
      const { token: newToken, user: newUser } = await authService.register(userData);
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(newUser);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message || 'Registration failed' };
    }
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isTeacher: user?.role === 'teacher',
    isStudent: user?.role === 'student',
  }), [user, loading, login, register, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
