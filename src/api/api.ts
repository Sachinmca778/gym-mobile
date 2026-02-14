import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Redis Token Management API
const redisApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Storage key constants for local caching
const STORAGE_KEYS = {
  USERNAME: 'username',
};

// Helper functions for Redis Token Storage
export const redisStorage = {
  /**
   * Store access token in Redis via API
   */
  async setAccessToken(username: string, token: string): Promise<void> {
    try {
      await redisApi.post(`/gym/auth/store-token?username=${username}&tokenType=access&token=${token}`);
      // Also cache username locally
      await AsyncStorage.setItem(STORAGE_KEYS.USERNAME, username);
    } catch (error) {
      console.error('Error storing access token in Redis:', error);
      throw error;
    }
  },

  /**
   * Store refresh token in Redis via API
   */
  async setRefreshToken(username: string, token: string): Promise<void> {
    try {
      await redisApi.post(`/gym/auth/store-token?username=${username}&tokenType=refresh&token=${token}`);
      await AsyncStorage.setItem(STORAGE_KEYS.USERNAME, username);
    } catch (error) {
      console.error('Error storing refresh token in Redis:', error);
      throw error;
    }
  },

  /**
   * Get access token from Redis via API
   */
  async getAccessToken(): Promise<string | null> {
    try {
      const username = await AsyncStorage.getItem(STORAGE_KEYS.USERNAME);
      if (!username) return null;
      
      const response = await redisApi.get(`/gym/auth/get-token/${username}/access`);
      return response.data.token;
    } catch (error) {
      console.error('Error getting access token from Redis:', error);
      return null;
    }
  },

  /**
   * Get refresh token from Redis via API
   */
  async getRefreshToken(): Promise<string | null> {
    try {
      const username = await AsyncStorage.getItem(STORAGE_KEYS.USERNAME);
      if (!username) return null;
      
      const response = await redisApi.get(`/gym/auth/get-token/${username}/refresh`);
      return response.data.token;
    } catch (error) {
      console.error('Error getting refresh token from Redis:', error);
      return null;
    }
  },

  /**
   * Store both tokens in Redis
   */
  async storeTokens(username: string, accessToken: string, refreshToken: string): Promise<void> {
    await this.setAccessToken(username, accessToken);
    await this.setRefreshToken(username, refreshToken);
  },

  /**
   * Delete all tokens from Redis via API
   */
  async deleteTokens(): Promise<void> {
    try {
      const username = await AsyncStorage.getItem(STORAGE_KEYS.USERNAME);
      if (username) {
        await redisApi.delete(`/gym/auth/delete-tokens/${username}`);
        await AsyncStorage.removeItem(STORAGE_KEYS.USERNAME);
      }
    } catch (error) {
      console.error('Error deleting tokens from Redis:', error);
      throw error;
    }
  },
};

// Import AsyncStorage for username caching
import AsyncStorage from '@react-native-async-storage/async-storage';

// Add auth token to requests
api.interceptors.request.use(
  async (config) => {
    const token = await redisStorage.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle auth errors and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await redisStorage.getRefreshToken();
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/gym/auth/refresh`, null, {
            params: { refreshToken },
          });

          const { accessToken, refreshToken: newRefreshToken } = response.data;
          
          // Get username for storing tokens
          const username = await AsyncStorage.getItem(STORAGE_KEYS.USERNAME);
          if (username) {
            await redisStorage.storeTokens(username, accessToken, newRefreshToken);
          }

          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, delete tokens from Redis and logout
        await redisStorage.deleteTokens();
      }
    }

    return Promise.reject(error);
  }
);

export default api;

