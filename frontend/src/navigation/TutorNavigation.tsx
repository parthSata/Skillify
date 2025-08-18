import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { TutorAnalyticsView, TutorCreateCourseView, TutorDashboardView, TutorCoursesView, TutorCategoriesView } from '@/components/index';

const TutorNavigation: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="dashboard" replace />} />
      <Route path="dashboard" element={<TutorDashboardView />} />
      <Route path="courses" element={<TutorCoursesView />} />
      {/* This component will handle fetching and displaying all courses */}
      <Route path="create-course" element={<TutorCreateCourseView />} />
      {/* This is the new route for editing a course */}
      <Route path="edit-course/:courseId" element={<TutorCreateCourseView />} />
      <Route path="categories" element={<TutorCategoriesView />} />
      <Route path="analytics" element={<TutorAnalyticsView />} />
      <Route path="*" element={<div>404 Tutor Page Not Found</div>} />
    </Routes>
  );
};

export default TutorNavigation;