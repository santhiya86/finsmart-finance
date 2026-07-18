import { createContext, useContext, useState, useEffect } from 'react';
import { loginUser as loginAPI, registerUser as registerAPI, getProfile } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const stored = localStorage.getItem('user');
        if (!stored) { setAuthChecked(true); return; }
        const storedUser = JSON.parse(stored);
        if (!storedUser?.token) { setAuthChecked(true); return; }
        const { data } = await getProfile();
        setUser({ ...storedUser, ...data });
      } catch {
        setUser(null);
        localStorage.removeItem('user');
      } finally {
        setAuthChecked(true);
      }
    };
    verifyToken();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await loginAPI({ email, password });
      setUser(data);
      localStorage.setItem('user', JSON.stringify(data));
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Login failed' };
    } finally { setLoading(false); }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    try {
      await registerAPI({ name, email, password });
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Registration failed' };
    } finally { setLoading(false); }
  };

  const logout = () => { setUser(null); localStorage.removeItem('user'); };

  if (!authChecked) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-500 text-sm font-medium">Loading FinSmart...</p>
      </div>
    </div>
  );

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
