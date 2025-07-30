import { useState, useEffect } from "react";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LandingPage } from "./pages/student/LandingPage";
import { Login } from "./pages/shared/Login";
import { Register } from "./pages/shared/Register";
import { AdminLogin } from "./pages/admin/AdminLogin";
import { Navigation } from "./components/Navigation";
import { AdminDashboard } from "./components/AdminDashboard";
import { TutorDashboard } from "./pages/tutor/TutorDashboard";
import { StudentDashboard } from "./components/StudentDashboard";
import { type UserType } from "./types";

type AppState = "landing" | "login" | "register" | "admin-login" | "dashboard";

function App() {
  const [currentState, setCurrentState] = useState<AppState>("landing");
  const [userType, setUserType] = useState<UserType>("student");
  const [currentView, setCurrentView] = useState("dashboard");

  useEffect(() => {
    const pathname = window.location.pathname;
    if (pathname === "/login") {
      setCurrentState("login");
    } else if (pathname === "/register") {
      setCurrentState("register");
    } else if (pathname === "/admin/login") {
      setCurrentState("admin-login");
    } else {
      setCurrentState("landing");
    }
  }, []);

  const handleAuth = (type: UserType) => {
    setUserType(type);
    setCurrentState("dashboard");
    setCurrentView("dashboard");
    if (type === "admin") {
      window.history.pushState({}, "", "/admin/dashboard");
    } else {
      window.history.pushState({}, "", "/dashboard");
    }
  };

  const handleBack = () => {
    setCurrentState("landing");
    window.history.pushState({}, "", "/");
  };

  const renderDashboard = () => {
    switch (userType) {
      case "admin":
        return <AdminDashboard currentView={currentView} />;
      case "tutor":
        return <TutorDashboard currentView={currentView} />;
      case "student":
        return <StudentDashboard currentView={currentView} />;
      default:
        return null;
    }
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        {currentState === "landing" && <LandingPage onAuthClick={() => setCurrentState("login")} />}

        {currentState === "login" && (
          <Login onAuth={handleAuth} onBack={handleBack} />
        )}

        {currentState === "register" && (
          <Register onAuth={handleAuth} onBack={handleBack} />
        )}

        {currentState === "admin-login" && (
          <AdminLogin onAuth={handleAuth} onBack={handleBack} />
        )}

        {currentState === "dashboard" && (
          <div className="flex h-screen">
            <div className="w-64 fixed inset-y-0 left-0 z-50">
              <Navigation
                currentView={currentView}
                onViewChange={setCurrentView}
                userType={userType}
              />
            </div>
            <div className="flex-1 ml-64 overflow-auto">{renderDashboard()}</div>
          </div>
        )}
      </div>
    </ThemeProvider>
  );
}

export default App;