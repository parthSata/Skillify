// src/components/StudentNavigation.tsx

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { StudentDashboard } from '@/components/index';

interface StudentNavigationProps {
  initialView?: string;
}

const StudentNavigation: React.FC<StudentNavigationProps> = ({ initialView = 'dashboard' }) => {
  return (
    <Routes>
      <Route path="/" element={<StudentDashboard currentView={initialView} />} />
      <Route path="dashboard" element={<StudentDashboard currentView="dashboard" />} />
      <Route path="browse" element={<StudentDashboard currentView="browse" />} />
      <Route path="my-courses" element={<StudentDashboard currentView="my-courses" />} />
      <Route path="progress" element={<StudentDashboard currentView="progress" />} />
    </Routes>
  );
};

export default StudentNavigation;