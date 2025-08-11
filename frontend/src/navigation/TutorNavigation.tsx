// src/components/TutorNavigation.tsx

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { TutorDashboard } from '@/components/index';

interface TutorNavigationProps {
  initialView?: string;
}

const TutorNavigation: React.FC<TutorNavigationProps> = ({ initialView = 'dashboard' }) => {
  return (
    <Routes>
      <Route path="/" element={<TutorDashboard currentView={initialView} />} />
      <Route path="dashboard" element={<TutorDashboard currentView="dashboard" />} />
      <Route path="courses" element={<TutorDashboard currentView="courses" />} />
      <Route path="create-course" element={<TutorDashboard currentView="create-course" />} />
      <Route path="categories" element={<TutorDashboard currentView="categories" />} />
      <Route path="analytics" element={<TutorDashboard currentView="analytics" />} />
    </Routes>
  );
};

export default TutorNavigation;