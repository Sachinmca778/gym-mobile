import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as React from 'react';
import axios from 'axios';

import api from '../api/api';
import { User, AuthRequest, AuthResponse } from '../types';
import { API_BASE_URL } from '../utils/constants';

// SecureStore wrapper with fallback for web
const secureStore = {
  async getItemAsync(key: string): Promise<string | null> {
    try {
      const SecureStore = await import('expo-secure-store');
      return await SecureStore.getItemAsync(key);
    } catch {
      // Fallback for web
      if (typeof window !== 'undefined') {
        return localStorage.getItem(key);
      }
      return null;
    }
  },
  async setItemAsync(key: string, value: string): Promise<void> {
    try {
      const SecureStore = await import('expo-secure-store');
      await SecureStore.setItemAsync(key, value);
    } catch {
      // Fallback for web
      if (typeof window !== 'undefined') {
        localStorage.setItem(key, value);
      }
    }
  },
  async deleteItemAsync(key: string): Promise<void> {
    try {
      const SecureStore = await import('expo-secure-store');
      await SecureStore.deleteItemAsync(key);
    } catch {
      // Fallback for web
      if (typeof window !== 'undefined') {
        localStorage.removeItem(key);
      }
    }
  }
};

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
      const token = await secureStore.getItemAsync('accessToken');
      const role = await secureStore.getItemAsync('userRole');
      const username = await secureStore.getItemAsync('username');

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

      // Store tokens securely
      await secureStore.setItemAsync('accessToken', accessToken);
      await secureStore.setItemAsync('refreshToken', refreshToken);
      await secureStore.setItemAsync('userRole', role);
      await secureStore.setItemAsync('username', username);
      await secureStore.setItemAsync('userId', String(userId));

      setUser({
        id: userId,
        username,
        email: '',
        firstName: name?.split(' ')[0] || '',
        lastName: name?.split(' ')[1] || '',
        role,
        accessToken,
        refreshToken,
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
      // Get the token from secureStore
      const token = await secureStore.getItemAsync('accessToken');
      
      // Use fresh axios instance without interceptors to avoid auth issues
      if (token) {
        await axios.post(`${API_BASE_URL}/gym/auth/logout?token=${encodeURIComponent(token)}`);
      }
    } catch (err) {
      console.error('Backend logout error, clearing local data:', err);
      // Continue with local logout even if backend fails
    } finally {
      // Clear stored data from both SecureStore and localStorage
      await secureStore.deleteItemAsync('accessToken');
      await secureStore.deleteItemAsync('refreshToken');
      await secureStore.deleteItemAsync('userRole');
      await secureStore.deleteItemAsync('username');
      await secureStore.deleteItemAsync('userId');
      await secureStore.deleteItemAsync('memberId');
      
      // Also clear from localStorage (used by api interceptor)
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userRole');
        localStorage.removeItem('username');
        localStorage.removeItem('userId');
      }
      
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

