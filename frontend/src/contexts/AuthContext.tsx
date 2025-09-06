import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import axios from "axios";

export interface User {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "tutor" | "student";
  avatar?: string;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

interface ApiResponse<T> {
  statusCode: number;
  data: T;
  message: string;
  success: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, navigate: any) => Promise<void>;
  // FIX: Add the loginAdmin function to the context type
  loginAdmin: (email: string, password: string, navigate: any) => Promise<void>;
  register: (data: FormData, navigate: any) => Promise<void>;
  logout: (navigate: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

axios.defaults.withCredentials = true;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const skipAuthCheck = useRef(false);

  const checkAuth = async () => {
    if (skipAuthCheck.current) {
      setLoading(false);
      skipAuthCheck.current = false;
      return;
    }

    try {
      setLoading(true);
      const { data } = await axios.get<ApiResponse<User>>("http://localhost:3000/api/v1/users/me");
      if (data.success && data.data) {
        const userData = data.data;
        if (userData && typeof userData._id === 'string' && typeof userData.email === 'string' && typeof userData.role === 'string') {
          const newUser: User = {
            _id: userData._id,
            name: userData.name,
            email: userData.email,
            role: userData.role,
            isApproved: userData.isApproved,
            avatar: userData.avatar,
            createdAt: userData.createdAt,
            updatedAt: userData.updatedAt,
            __v: userData.__v,
          };
          setUser(newUser);
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const handleAuthSuccess = (userData: User, navigate: any) => {
    setUser(userData);
    const redirectPath =
      userData.role === 'admin'
        ? '/admin/dashboard'
        : userData.role === 'tutor'
          ? '/tutor/dashboard'
          : '/student/dashboard';
    navigate(redirectPath, { replace: true });
    setLoading(false);
  };

  const login = async (email: string, password: string, navigate: any) => {
    try {
      setLoading(true);
      const { data } = await axios.post<ApiResponse<User>>("http://localhost:3000/api/v1/users/login", { email, password });
      if (data.success && data.data) {
        const userData = data.data;
        if (userData && typeof userData._id === 'string' && typeof userData.email === 'string' && typeof userData.role === 'string') {
          if (userData.role === 'admin') {
            throw new Error('Admins must use the admin login portal.');
          }
          const newUser: User = {
            _id: userData._id,
            name: userData.name,
            email: userData.email,
            role: userData.role,
            isApproved: userData.isApproved,
            avatar: userData.avatar,
            createdAt: userData.createdAt,
            updatedAt: userData.updatedAt,
            __v: userData.__v,
          };
          handleAuthSuccess(newUser, navigate);
        } else {
          throw new Error('Login failed: Invalid user data received from API');
        }
      } else {
        throw new Error('Login failed');
      }
    } catch (error: any) {
      setLoading(false);
      throw new Error(error.response?.data?.message || error.message || 'Login failed');
    }
  };

  const loginAdmin = async (email: string, password: string, navigate: any) => {
    try {
      setLoading(true);
      const { data } = await axios.post<ApiResponse<User>>("http://localhost:3000/api/v1/admin/login", { email, password });
      if (data.success && data.data) {
        const userData = data.data;
        if (userData && typeof userData._id === 'string' && typeof userData.email === 'string' && typeof userData.role === 'string') {
          if (userData.role !== 'admin') {
            throw new Error('Access denied. This portal is for administrators only.');
          }
          const newUser: User = {
            _id: userData._id,
            name: userData.name,
            email: userData.email,
            role: userData.role,
            isApproved: userData.isApproved,
            avatar: userData.avatar,
            createdAt: userData.createdAt,
            updatedAt: userData.updatedAt,
            __v: userData.__v,
          };
          handleAuthSuccess(newUser, navigate);
        } else {
          throw new Error('Login failed: Invalid user data received from API');
        }
      } else {
        throw new Error('Admin login failed');
      }
    } catch (error: any) {
      setLoading(false);
      throw new Error(error.response?.data?.message || error.message || 'Admin login failed');
    }
  };

  const register = async (formData: FormData, navigate: any) => {
    try {
      setLoading(true);
      const { data: response } = await axios.post<ApiResponse<User>>("http://localhost:3000/api/v1/users/register", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (response.success && response.data) {
        const userData = response.data;
        if (userData && typeof userData._id === 'string' && typeof userData.email === 'string' && typeof userData.role === 'string') {
          const newUser: User = {
            _id: userData._id,
            name: userData.name,
            email: userData.email,
            role: userData.role,
            isApproved: userData.isApproved,
            avatar: userData.avatar,
            createdAt: userData.createdAt,
            updatedAt: userData.updatedAt,
            __v: userData.__v,
          };
          handleAuthSuccess(newUser, navigate);
        } else {
          throw new Error('Registration failed: Invalid user data received from API');
        }
      } else {
        throw new Error('Registration failed');
      }
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const logout = async (navigate: any) => {
    skipAuthCheck.current = true;
    try {
      await axios.post("http://localhost:3000/api/v1/users/logout");
    } finally {
      setUser(null);
      navigate("/", { replace: true });
    }
  };

  // FIX: Add loginAdmin to the value object
  const value = { user, loading, login, loginAdmin, register, logout };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
};