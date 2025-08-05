import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'tutor' | 'student';
  avatar?: string;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: FormData) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
  refreshToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

axios.defaults.withCredentials = true;
axios.defaults.baseURL = 'http://localhost:3000/api/v1';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get<{ statusCode: number; data: string; message: User; success: boolean }>('/users/me', {
        withCredentials: true,
      });
      console.log('Check auth response:', data);
      if (data.success && data.message) {
        setUser(data.message);
        return true;
      } else {
        setUser(null);
        return false;
      }
    } catch (error: any) {
      console.error('Check auth failed:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      setUser(null);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const refreshToken = async () => {
    try {
      const { data } = await axios.post<{ token: string }>('/users/refresh-token', {}, { withCredentials: true });
      console.log('Refresh token response:', data);
      if (data.token) {
        localStorage.setItem('accessToken', data.token);
        await checkAuth();
        return data.token;
      }
      return null;
    } catch (error: any) {
      console.error('Token refresh failed:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      setUser(null);
      localStorage.removeItem('accessToken');
      return null;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      localStorage.removeItem('accessToken'); // Clear stale token
      await refreshToken(); // Attempt token refresh
      const { data } = await axios.post(
        '/users/login',
        { email, password },
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true,
        }
      );
      console.log('Login response:', JSON.stringify(data, null, 2));
      // Handle various response structures
      const userData = data.message || data.user || data.data?.user || data.data;
      const token = data.token || data.accessToken || data.data?.token;
      const success = data.success !== undefined ? data.success : !!userData;

      if (success && userData) {
        const formattedUser: User = {
          _id: userData._id || userData.id || 'unknown',
          name: userData.name || 'Unknown User',
          email: userData.email || email,
          role: userData.role || 'student',
          isApproved: userData.isApproved !== undefined ? userData.isApproved : true,
          createdAt: userData.createdAt || new Date().toISOString(),
          updatedAt: userData.updatedAt || new Date().toISOString(),
          avatar: userData.avatar || undefined,
          __v: userData.__v || 0,
        };
        setUser(formattedUser);
        if (token) {
          localStorage.setItem('accessToken', token);
        } else {
          console.warn('No token provided in login response. Subsequent requests may fail without authentication.');
        }
        return true;
      } else {
        console.error('Login failed: Invalid response structure', data);
        throw new Error('Login failed: Invalid response from server');
      }
    } catch (error: any) {
      console.error('Login error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers,
      });
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Login failed: Please check your credentials or server status';
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const register = async (formData: FormData) => {
    try {
      setLoading(true);
      const { data } = await axios.post<{ statusCode: number; data: string; message: User; token: string; success: boolean }>(
        '/users/register',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true,
        }
      );
      console.log('Register response:', data);
      if (data.success && data.message) {
        setUser(data.message);
        if (data.token) {
          localStorage.setItem('accessToken', data.token);
        } else {
          console.warn('No token provided in register response.');
        }
        return true;
      } else {
        console.error('Registration failed: Invalid response structure', data);
        throw new Error('Registration failed: Invalid response from server');
      }
    } catch (error: any) {
      console.error('Registration error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      const errorMessage =
        error.response?.data?.message || error.message || 'Registration failed. Please try again.';
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await axios.post('/users/logout', {}, { withCredentials: true });
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('accessToken');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, checkAuth, refreshToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
};