// src/components/AdminNavigation.tsx

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminAnalyticsView, AdminCategoriesView, AdminCoursesView, AdminCreateCourseView, AdminDashboardView, AdminStudentsView, AdminTutorsView, } from '@/components/index';

interface AdminNavigationProps {
  initialView?: string;
}

const AdminNavigation: React.FC<AdminNavigationProps> = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="dashboard" replace />} />
      <Route path="dashboard" element={<AdminDashboardView />} />
      <Route path="tutors" element={<AdminTutorsView />} />
      <Route path="students" element={<AdminStudentsView />} />
      <Route path="courses" element={<AdminCoursesView />} />
      <Route path="categories" element={<AdminCategoriesView />} />
      <Route path="create-course" element={<AdminCreateCourseView />} />
      {/* Analytics route remains the same, you can add a dedicated component for it */}
      <Route path="analytics" element={<AdminAnalyticsView />} />
      <Route path="*" element={<div>404 Admin Page Not Found</div>} />
    </Routes>
  );
};

export default AdminNavigation;