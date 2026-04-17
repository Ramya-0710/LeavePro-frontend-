import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../utils/api';

const AuthCtx = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    const token = localStorage.getItem('lf_token');
    const saved  = localStorage.getItem('lf_user');
    if (token && saved) {
      try { setUser(JSON.parse(saved)); } catch {}
      authAPI.me()
        .then(r => { setUser(r.data.user); localStorage.setItem('lf_user', JSON.stringify(r.data.user)); })
        .catch(() => { localStorage.removeItem('lf_token'); localStorage.removeItem('lf_user'); setUser(null); })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    setError('');
    try {
      const res = await authAPI.login({ email, password });
      const { token, user: u } = res.data;
      localStorage.setItem('lf_token', token);
      localStorage.setItem('lf_user', JSON.stringify(u));
      setUser(u);
      return { success: true, user: u };
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      setError(msg);
      return { success: false, message: msg };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('lf_token');
    localStorage.removeItem('lf_user');
    setUser(null);
  }, []);

  const updateUser = useCallback((updates) => {
    setUser(prev => {
      const next = { ...prev, ...updates };
      localStorage.setItem('lf_user', JSON.stringify(next));
      return next;
    });
  }, []);

  const isAdmin   = user?.sysRole === 'admin';
  const isManager = user?.sysRole === 'manager';
  const isEmployee= user?.sysRole === 'employee';
  const isManagerOrAdmin = isAdmin || isManager;

  return (
    <AuthCtx.Provider value={{ user, loading, error, setError, login, logout, updateUser, isAdmin, isManager, isEmployee, isManagerOrAdmin }}>
      {children}
    </AuthCtx.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};
