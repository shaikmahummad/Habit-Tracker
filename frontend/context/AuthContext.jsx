import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token');
        const storedUser = await AsyncStorage.getItem('user');
        if (storedToken) setToken(storedToken);
        if (storedUser) setUser(JSON.parse(storedUser));
      } catch (_) {
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const persist = async (tkn, userObj) => {
    await AsyncStorage.setItem('token', tkn);
    await AsyncStorage.setItem('user', JSON.stringify(userObj));
    setToken(tkn);
    setUser(userObj);
  };

  // Backend returns { _id, name, email, xp, level, token }
  const login = async (email, password) => {
    const data = await authApi.login({ email, password });
    const userObj = {
      _id: data._id,
      name: data.name || '',
      email: data.email,
      xp: data.xp ?? 0,
      level: data.level ?? 1,
    };
    await persist(data.token, userObj);
    return data;
  };

  const register = async (name, email, password) => {
    const data = await authApi.register({ name, email, password });
    const userObj = {
      _id: data._id,
      name: data.name || name || '',
      email: data.email,
      xp: data.xp ?? 0,
      level: data.level ?? 1,
    };
    await persist(data.token, userObj);
    return data;
  };

  const logout = async () => {
    await AsyncStorage.multiRemove(['token', 'user']);
    setToken(null);
    setUser(null);
  };

  const updateUser = (updates) => {
    const updated = { ...user, ...updates };
    setUser(updated);
    AsyncStorage.setItem('user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
