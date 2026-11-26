import React, { useEffect, useState } from 'react';
import type { User } from '../types';
import { apiClient } from '../services/api/apiClient';
import { dataSource } from '../services';
import { createMockAuth } from '../services/mock/auth';
import { AuthContext } from './useAuth';

// With the mock data source there is no backend: sign-in is handled in the browser (demo only).
const mockAuth = dataSource === 'mock' ? createMockAuth() : null;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;
    void (async () => {
      try {
        const next = mockAuth
          ? await mockAuth.me()
          : (await apiClient<{ user: User }>('/auth/me')).user;
        if (mounted) setUser(next);
      } catch {
        if (mounted) setUser(null);
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    if (mockAuth) {
      setUser(await mockAuth.login(email, password));
      return;
    }
    const res = await apiClient<{ user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setUser(res.user);
  };

  const register = async (name: string, email: string, password: string): Promise<void> => {
    if (mockAuth) {
      setUser(await mockAuth.register(name, email, password));
      return;
    }
    const res = await apiClient<{ user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
    setUser(res.user);
  };

  const logout = async (): Promise<void> => {
    try {
      if (mockAuth) await mockAuth.logout();
      else await apiClient('/auth/logout', { method: 'POST' });
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
