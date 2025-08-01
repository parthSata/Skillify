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
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Axios default config
axios.defaults.withCredentials = true;
axios.defaults.baseURL = "http://localhost:3000/api/v1";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get<{ data: User }>("/users/me", { withCredentials: true });
      setUser(data.data);
      return true;
    } catch {
      setUser(null);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const refreshToken = async () => {
    try {
      const { data } = await axios.post<{ token: string }>("/users/refresh-token");
      localStorage.setItem("accessToken", data.token);
    } catch (error) {
      setUser(null);
      throw new Error("Token refresh failed");
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data } = await axios.post<{ data: User; token: string }>("/users/login", { email, password });
      setUser(data.data);
      localStorage.setItem("accessToken", data.token);
      return true;
    } catch {
      setUser(null);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: FormData) => {
    try {
      setLoading(true);
      const { data: response } = await axios.post<{ data: User; token: string }>("/users/register", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUser(response.data);
      localStorage.setItem("accessToken", response.token);
      return true;
    } catch {
      setUser(null);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await axios.post("/users/logout");
    } finally {
      setUser(null);
      localStorage.removeItem("accessToken");
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
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
};