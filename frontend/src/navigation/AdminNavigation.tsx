import { Routes, Route } from 'react-router-dom';
import { AdminDashboard } from '@/components/index';

interface AdminNavigationProps {
  initialView?: string;
}

const AdminNavigation: React.FC<AdminNavigationProps> = ({ initialView = 'dashboard' }) => {
  return (
    <Routes>
      <Route path="/" element={<AdminDashboard currentView={initialView} />} />
      <Route path="dashboard" element={<AdminDashboard currentView="dashboard" />} />
      <Route path="courses" element={<AdminDashboard currentView="courses" />} />
      <Route path="categories" element={<AdminDashboard currentView="categories" />} />
      <Route path="create-course" element={<AdminDashboard currentView="create-course" />} />
      <Route path="analytics" element={<AdminDashboard currentView="analytics" />} />
    </Routes>
  );
};

export default AdminNavigation;