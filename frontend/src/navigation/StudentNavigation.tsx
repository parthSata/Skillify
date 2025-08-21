// src/components/StudentNavigation.tsx

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { StudentDashboardHome, StudentBrowseCourses, StudentMyCourses, StudentProgress, StudentCourseDetails, PageNotFound } from '@/components/index';

const StudentNavigation: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="dashboard" replace />} />
      <Route path="dashboard" element={<StudentDashboardHome />} />
      <Route path="browse" element={<StudentBrowseCourses />} />
      <Route path="my-courses" element={<StudentMyCourses />} />
      <Route path="progress" element={<StudentProgress />} />
      <Route path="course-details/:courseId" element={<StudentCourseDetails />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

export default StudentNavigation;