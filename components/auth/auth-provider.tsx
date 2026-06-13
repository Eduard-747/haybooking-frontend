"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

interface User {
  userId: string;
  phoneNumber?: string;
  role: string;
  name?: string;
  surname?: string;
  email?: string;
  image?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (token: string, user: User, redirectTo?: string) => void;
  logout: () => void;
  updateToken: (token: string, user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const response = await api.get('/auth/profile');
          setUser(response.data);
        } catch (error: any) {
          if (error?.response?.status !== 401) {
            console.error('Failed to fetch user profile', error);
          }
          localStorage.removeItem('access_token');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (token: string, userData: User, redirectTo?: string) => {
    localStorage.setItem('access_token', token);
    
    let fullUser = userData;
    try {
      const response = await api.get('/auth/profile');
      fullUser = response.data;
    } catch (e) {
      console.error('Failed to fetch full profile during login', e);
    }

    setUser(fullUser);

    if (redirectTo) {
      router.push(redirectTo);
    } else if (fullUser.role === 'partner') {
      router.push('/dashboard');
    } else if (fullUser.role === 'super_admin') {
      router.push('/admin/dashboard');
    } else {
      router.push('/client/discover');
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setUser(null);
    router.push('/auth');
  };

  const updateToken = (token: string, userData: User) => {
    localStorage.setItem('access_token', token);
    setUser(userData);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
