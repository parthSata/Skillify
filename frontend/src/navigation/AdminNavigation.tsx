import { Routes, Route } from "react-router-dom";
import { AdminDashboard } from "@/components/index";

interface AdminNavigationProps {
    currentView: string;
    onViewChange: (view: string) => void;
}

const AdminNavigation = ({ currentView, onViewChange }: AdminNavigationProps) => {
    return (
        <Routes>
            <Route path="/" element={<AdminDashboard currentView={currentView} onViewChange={onViewChange} />} />
            <Route path="dashboard" element={<AdminDashboard currentView={currentView} onViewChange={onViewChange} />} />
            {/* Add more admin routes here, e.g., <Route path="users" element={<UsersManagement />} /> */}
        </Routes>
    );
};

export default AdminNavigation;