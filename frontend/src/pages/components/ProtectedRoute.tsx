import { useEffect, useState, useCallback } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  allowedRoles: Array<'admin' | 'tutor' | 'student'>;
  children: React.ReactNode;
}

const parseToken = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    throw new Error('Invalid token');
  }
};

const ProtectedRoute = ({ allowedRoles, children }: ProtectedRouteProps) => {
  const { user, loading, refreshToken } = useAuth();
  const location = useLocation();
  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null);

  const validateToken = useCallback(async () => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      setIsTokenValid(false);
      return;
    }

    try {
      const { exp } = parseToken(accessToken);
      if (exp && exp * 1000 < Date.now()) {
        const newToken = await refreshToken();
        if (newToken) {
          setIsTokenValid(true);
        } else {
          setIsTokenValid(false);
          localStorage.removeItem('accessToken');
        }
      } else {
        setIsTokenValid(true);
      }
    } catch {
      setIsTokenValid(false);
      localStorage.removeItem('accessToken');
    }
  }, [refreshToken]);

  useEffect(() => {
    validateToken();
  }, [validateToken]);

  if (loading || isTokenValid === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!isTokenValid || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;