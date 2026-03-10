import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { mockLogin, mockRegister, mockGetMe } from '../data/mockUsers';

const AuthContext = createContext(null);

axios.defaults.baseURL = import.meta.env.VITE_API_URL || '/api';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Si es token mock, restaurar desde mockUsers
      if (token.startsWith('mock-token-')) {
        const mockUser = mockGetMe(token);
        setUser(mockUser);
        setLoading(false);
        return;
      }

      axios.get('/auth/me')
        .then(res => setUser(res.data))
        .catch(() => {
          // Intentar restaurar con mock si el backend no responde
          const mockUser = mockGetMe(token);
          if (mockUser) {
            setUser(mockUser);
          } else {
            localStorage.removeItem('token');
            delete axios.defaults.headers.common['Authorization'];
          }
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      const res = await axios.post('/auth/login', { email, password });
      const { user, token } = res.data;
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      return user;
    } catch (err) {
      // Fallback mock cuando no hay backend
      if (!err.response) {
        const { user, token } = mockLogin(email, password);
        localStorage.setItem('token', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setUser(user);
        return user;
      }
      throw err;
    }
  };

  const register = async (data) => {
    try {
      const res = await axios.post('/auth/register', data);
      const { user, token } = res.data;
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      return user;
    } catch (err) {
      // Fallback mock cuando no hay backend
      if (!err.response) {
        const { user, token } = mockRegister(data);
        localStorage.setItem('token', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setUser(user);
        return user;
      }
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
