import { createContext, useContext, useState, useEffect, useRef } from 'react';
import api, { setAuthHandlers } from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const accessTokenRef = useRef(null);

  useEffect(() => {
    setAuthHandlers(
      () => accessTokenRef.current,
      (newToken) => {
        accessTokenRef.current = newToken;
      }
    );
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);
        const refreshRes = await api.post('/auth/refresh', {}, { signal: controller.signal });
        clearTimeout(timeout);
        accessTokenRef.current = refreshRes.data.accessToken;
        const meRes = await api.get('/auth/me');
        setUser(meRes.data.user);
      } catch {
        setUser(null);
        accessTokenRef.current = null;
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    accessTokenRef.current = res.data.accessToken;
    setUser(res.data.user);
    return res.data.user;
  };

  const logout = async () => {
    await api.post('/auth/logout');
    accessTokenRef.current = null;
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
