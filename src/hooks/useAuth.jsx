import { createContext, useContext, useEffect, useCallback, useState } from 'react';
import * as authService from '@/services/authService';
import { setAccessToken, getAccessToken } from '@/services/api';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const token = getAccessToken();
    if (!token) {
      setLoading(false);
      return;
    }
    authService
      .getCurrentUser()
      .then(({ user }) => {
        if (!cancelled) setUser(user);
      })
      .catch(() => setAccessToken(null))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email, password) => {
    const { user, accessToken } = await authService.loginUser(email, password);
    setAccessToken(accessToken);
    setUser(user);
  }, []);

  const register = useCallback(async (name, email, password) => {
    const { user, accessToken } = await authService.registerUser(name, email, password);
    setAccessToken(accessToken);
    setUser(user);
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logoutUser();
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
