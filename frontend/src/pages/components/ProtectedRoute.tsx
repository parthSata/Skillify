import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
    allowedRoles: Array<"admin" | "tutor" | "student">;
    children: React.ReactNode;
}

const ProtectedRoute = ({ allowedRoles, children }: ProtectedRouteProps) => {
    const { user, loading, refreshToken } = useAuth();
    const location = useLocation();
    const [isTokenValid, setIsTokenValid] = useState(true);

    useEffect(() => {
        const validateToken = async () => {
            const accessToken = localStorage.getItem("accessToken");
            if (!accessToken) {
                setIsTokenValid(false);
                return;
            }

            try {
                const { exp } = parseToken(accessToken);
                if (exp && exp * 1000 < Date.now()) {
                    await refreshToken();
                }
            } catch {
                setIsTokenValid(false);
            }
        };

        if (!loading && user) {
            validateToken();
        }
    }, [loading, user, refreshToken]);

    if (loading) {
        return <div>Loading...</div>; // Replace with a proper loading component
    }

    if (!isTokenValid || !user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (!allowedRoles.includes(user.role)) {
        return <Navigate to="/unauthorized" state={{ from: location }} replace />;
    }

    return <>{children}</>;
};

const parseToken = (token: string) => {
    try {
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
            Buffer.from(base64, "base64")
                .toString()
                .split("")
                .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                .join("")
        );
        return JSON.parse(jsonPayload);
    } catch {
        throw new Error("Invalid token");
    }
};

export default ProtectedRoute;