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
  __v?: number;
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

axios.defaults.withCredentials = true;
axios.defaults.baseURL = "http://localhost:3000/api/v1";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Only checkAuth ONCE on mount
  useEffect(() => {
    checkAuth();
    // eslint-disable-next-line
  }, []);

  const checkAuth = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get<{ statusCode: number; data: string; message: User; success: boolean }>("/users/me", {
        withCredentials: true,
      });
      if (data.success && data.message) {
        setUser(data.message);
        return true;
      } else {
        setUser(null);
        return false;
      }
    } catch (error) {
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

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data } = await axios.post<{ statusCode: number; data: string; message: User; token: string; success: boolean }>(
        "/users/login",
        { email, password }
      );
      if (data.success && data.message) {
        setUser(data.message); // user state will update here
        localStorage.setItem("accessToken", data.token);
        return true;
      } else {
        throw new Error("Login failed: Invalid user data");
      }
    } catch (error) {
      setUser(null);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (formData: FormData) => {
    try {
      setLoading(true);
      const { data: response } = await axios.post<{ statusCode: number; data: string; message: User; token: string; success: boolean }>(
        "/users/register",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      if (response.success && response.message) {
        setUser(response.message);
        localStorage.setItem("accessToken", response.token);
        return true;
      } else {
        throw new Error("Registration failed: Invalid user data");
      }
    } catch (error) {
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
