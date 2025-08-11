// ProtectedRoute.tsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import type { User } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  allowedRoles: Array<User["role"]>;
  children: React.ReactNode;
}

const ProtectedRoute = ({ allowedRoles, children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Wait for the initial authentication check to complete.
  if (loading) {
    return <div>Loading...</div>;
  }

  // If user is null (not authenticated), redirect to login page.
  if (!user) {
    console.log("🚀 ~ Redirecting to login because user is null.");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user exists, but their role is not allowed, redirect to unauthorized page.
  // user.role should now be defined if user is not null.
  if (!allowedRoles.includes(user.role)) {
    console.log("🚀 ~ Unauthorized user.role:", user.role);
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }

  // Check for unapproved tutors
  if (user.role === 'tutor' && !user.isApproved) {
    console.log("🚀 ~ Tutor account not yet approved.");
    return <Navigate to="/pending-approval" state={{ from: location }} replace />;
  }

  // All checks pass, render the children components.
  return <>{children}</>;
};

export default ProtectedRoute;