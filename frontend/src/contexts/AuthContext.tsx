import React, { createContext, useContext, useEffect, useState } from "react";
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
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: FormData) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Axios default config
axios.defaults.withCredentials = true;
axios.defaults.baseURL = "http://localhost:3000/api/v1";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check auth status on mount
  const checkAuth = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get<{ data: User }>(`/users/me`, { withCredentials: true });
      setUser(data.data);
      setLoading(false);
      return true;
    } catch {
      setUser(null);
      setLoading(false);
      return false;
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const res = await axios.post<{ data: User }>(`/users/login`, { email, password });
      setUser(res.data.data);
      setLoading(false);
      return true;
    } catch {
      setUser(null);
      setLoading(false);
      return false;
    }
  };

  const register = async (data: FormData) => {
    try {
      setLoading(true);
      const res = await axios.post<{ data: User }>(`/users/register`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUser(res.data.data);
      setLoading(false);
      return true;
    } catch {
      setUser(null);
      setLoading(false);
      return false;
    }
  };

  const logout = async () => {
    await axios.post(`/users/logout`);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, checkAuth }}>
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
