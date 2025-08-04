import { Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import {
    LandingPage,
    Login,
    Register,
    AdminLogin,
    AdminNavigation,
    TutorNavigation,
    StudentNavigation,
    ProtectedRoute,
    PageNotFound,
    Unauthorized,
} from "@/components/index";
import { useState, useCallback } from "react";

function App() {
    const [currentView, setCurrentView] = useState("dashboard");

    const handleViewChange = useCallback((view: string) => {
        setCurrentView(view);
    }, []);

    return (
        <ThemeProvider>
            <AuthProvider>
                <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
                    <Routes>
                        <Route path="/" element={<LandingPage onAuthClick={() => handleViewChange("login")} />} />
                        <Route path="/login" element={<Login onAuth={() => handleViewChange("dashboard")} onBack={() => handleViewChange("landing")} />} />
                        <Route path="/register" element={<Register onAuth={() => handleViewChange("dashboard")} onBack={() => handleViewChange("landing")} />} />
                        <Route
                            path="/admin/login"
                            element={<AdminLogin onAuth={() => handleViewChange("dashboard")} onBack={() => handleViewChange("landing")} />}
                        />
                        <Route
                            path="/admin/*"
                            element={<ProtectedRoute allowedRoles={["admin"]} children={<AdminNavigation currentView={currentView} onViewChange={handleViewChange} />} />}
                        />
                        <Route
                            path="/student/*"
                            element={
                                <ProtectedRoute allowedRoles={["student"]} children={<StudentNavigation currentView={currentView} onViewChange={handleViewChange} />} />
                            }
                        />
                        <Route
                            path="/tutor/*"
                            element={<ProtectedRoute allowedRoles={["tutor"]} children={<TutorNavigation currentView={currentView} onViewChange={handleViewChange} />} />}
                        />
                        <Route path="/unauthorized" element={<Unauthorized />} />
                        <Route path="*" element={<PageNotFound />} />
                    </Routes>
                </div>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;