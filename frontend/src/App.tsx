import React, { useState } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { LandingPage } from './components/LandingPage';
import { AuthPage } from './components/AuthPage';
import { AdminLoginPage } from './components/AdminLoginPage';
import { Navigation } from './components/Navigation';
import { AdminDashboard } from './components/AdminDashboard';
import { TutorDashboard } from './components/TutorDashboard';
import { StudentDashboard } from './components/StudentDashboard';

type AppState = 'landing' | 'auth' | 'admin-auth' | 'dashboard';
type UserType = 'admin' | 'tutor' | 'student';

function App() {
  const [currentState, setCurrentState] = useState<AppState>('landing');
  const [userType, setUserType] = useState<UserType>('student');
  const [currentView, setCurrentView] = useState('dashboard');

  // Check if current URL is admin login route
  React.useEffect(() => {
    const path = window.location.pathname;
    if (path === '/admin/login') {
      setCurrentState('admin-auth');
    }
  }, []);

  const handleAuthClick = () => {
    setCurrentState('auth');
  };

  const handleAuth = (type: UserType) => {
    setUserType(type);
    setCurrentState('dashboard');
    setCurrentView('dashboard');
    // Update URL based on user type
    if (type === 'admin') {
      window.history.pushState({}, '', '/admin/dashboard');
    } else {
      window.history.pushState({}, '', '/dashboard');
    }
  };

  const handleBack = () => {
    setCurrentState('landing');
    window.history.pushState({}, '', '/');
  };

  const renderDashboard = () => {
    switch (userType) {
      case 'admin':
        return <AdminDashboard currentView={currentView} />;
      case 'tutor':
        return <TutorDashboard currentView={currentView} />;
      case 'student':
        return <StudentDashboard currentView={currentView} />;
      default:
        return null;
    }
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        {currentState === 'landing' && (
          <LandingPage onAuthClick={handleAuthClick} />
        )}

        {currentState === 'auth' && (
          <AuthPage onAuth={handleAuth} onBack={handleBack} />
        )}

        {currentState === 'admin-auth' && (
          <AdminLoginPage onAuth={handleAuth} onBack={handleBack} />
        )}

        {currentState === 'dashboard' && (
          <div className="flex h-screen">
            <div className="w-64 fixed inset-y-0 left-0 z-50">
              <Navigation
                currentView={currentView}
                onViewChange={setCurrentView}
                userType={userType}
              />
            </div>
            <div className="flex-1 ml-64 overflow-auto">
              {renderDashboard()}
            </div>
          </div>
        )}
      </div>
    </ThemeProvider>
  );
}

export default App;