import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as React from 'react';
import axios from 'axios';

import api from '../api/api';
import { User, AuthRequest, AuthResponse } from '../types';
import { API_BASE_URL } from '../utils/constants';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: AuthRequest) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStoredUser();
  }, []);

  const loadStoredUser = async () => {
    try {
      // localStorage is now polyfilled to work on both web and React Native
      const token = localStorage.getItem('accessToken');
      const role = localStorage.getItem('userRole');
      const username = localStorage.getItem('username');
      const gymIdStr = localStorage.getItem('gymId');

      if (token && role) {
        setUser({
          id: 0,
          username: username || '',
          email: '',
          firstName: '',
          lastName: '',
          role: role,
          accessToken: token,
          refreshToken: '',
          gymId: gymIdStr ? parseInt(gymIdStr) : undefined,
        });
      }
    } catch (err) {
      console.error('Error loading stored user:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: AuthRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post<AuthResponse>('/gym/auth/login', credentials);
      const { accessToken, refreshToken, userId, username, role, name } = response.data;

      // Store tokens using localStorage (polyfilled for React Native)
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('userRole', role);
      localStorage.setItem('username', username);
      localStorage.setItem('userId', String(userId));

      // Store gymId if available in response
      const gymId = (response.data as any).gymId;
      if (gymId !== undefined) {
        localStorage.setItem('gymId', String(gymId));
      }

      setUser({
        id: userId,
        username,
        email: '',
        firstName: name?.split(' ')[0] || '',
        lastName: name?.split(' ')[1] || '',
        role,
        accessToken,
        refreshToken,
        gymId: gymId,
      });
    } catch (err: any) {
      console.log(err,'err');
      const message = err.response?.data?.message || 'Login failed. Please try again.';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Get the token from localStorage
      const token = localStorage.getItem('accessToken');
      
      // Use fresh axios instance without interceptors to avoid auth issues
      if (token) {
        await axios.post(`${API_BASE_URL}/gym/auth/logout?token=${encodeURIComponent(token)}`);
      }
    } catch (err) {
      console.error('Backend logout error, clearing local data:', err);
      // Continue with local logout even if backend fails
    } finally {
      // Clear all stored data
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userRole');
      localStorage.removeItem('username');
      localStorage.removeItem('userId');
      localStorage.removeItem('memberId');
      localStorage.removeItem('gymId');
      
      setUser(null);
    }
  };

  const clearError = () => setError(null);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    error,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;

