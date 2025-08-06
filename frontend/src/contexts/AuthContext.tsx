// AuthContext.tsx
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
  register: (data: FormData, navigate: any) => Promise<void>;
  logout: (navigate: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

axios.defaults.withCredentials = true;
axios.defaults.baseURL = "http://localhost:3000/api/v1";

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
      const { data } = await axios.get<ApiResponse<User>>("/users/me");
      if (data.success && data.data) {
        setUser(data.data);
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
        ? '/admin'
        : userData.role === 'tutor'
          ? '/tutor'
          : '/student';
    navigate(redirectPath, { replace: true });
    setLoading(false);
  };

  const login = async (email: string, password: string, navigate: any) => {
    try {
      setLoading(true);
      const { data } = await axios.post<ApiResponse<User>>("/users/login", { email, password });
      if (data.success && data.data) {
        handleAuthSuccess(data.data, navigate);
      } else {
        throw new Error('Login failed');
      }
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const register = async (formData: FormData, navigate: any) => {
    try {
      setLoading(true);
      const { data: response } = await axios.post<ApiResponse<User>>("/users/register", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (response.success && response.data) {
        handleAuthSuccess(response.data, navigate);
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
      await axios.post("/users/logout");
    } finally {
      setUser(null);
      navigate("/", { replace: true });
    }
  };

  const value = { user, loading, login, register, logout };

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