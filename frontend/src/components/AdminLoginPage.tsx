import React from 'react';
import { AuthPage } from './AuthPage';

interface AdminLoginPageProps {
  onAuth: (userType: 'admin' | 'tutor' | 'student') => void;
  onBack: () => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onAuth, onBack }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 dark:from-gray-900 dark:via-red-900/10 dark:to-orange-900/10">
      <AuthPage onAuth={onAuth} onBack={onBack} isAdminRoute={true} />
    </div>
  );
};