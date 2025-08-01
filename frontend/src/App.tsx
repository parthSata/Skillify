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
    Unauthorized
} from "@/components/index";
import { useState } from "react";

function App() {
    const [currentView, setCurrentView] = useState("dashboard");

    return (
        <ThemeProvider>
            <AuthProvider>
                <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
                    <Routes>
                        <Route path="/" element={<LandingPage onAuthClick={() => setCurrentView("login")} />} />
                        <Route path="/login" element={<Login onAuth={() => setCurrentView("dashboard")} onBack={() => setCurrentView("landing")} />} />
                        <Route path="/register" element={<Register onAuth={() => setCurrentView("dashboard")} onBack={() => setCurrentView("landing")} />} />
                        <Route path="/admin/login" element={<AdminLogin onAuth={() => setCurrentView("dashboard")} onBack={() => setCurrentView("landing")} />} />
                        <Route
                            path="/admin/*"
                            element={
                                <ProtectedRoute allowedRoles={["admin"]} children={<AdminNavigation currentView={currentView} onViewChange={setCurrentView} />} />
                            }
                        />
                        <Route
                            path="/student/*"
                            element={
                                <ProtectedRoute allowedRoles={["student"]} children={<StudentNavigation currentView={currentView} onViewChange={setCurrentView} />} />
                            }
                        />
                        <Route
                            path="/tutor/*"
                            element={
                                <ProtectedRoute allowedRoles={["tutor"]} children={<TutorNavigation currentView={currentView} onViewChange={setCurrentView} />} />
                            }
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