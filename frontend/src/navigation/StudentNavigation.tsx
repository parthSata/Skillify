import { Routes, Route } from "react-router-dom";
import { StudentDashboard } from "@/components/index";

interface StudentNavigationProps {
    currentView: string;
    onViewChange: (view: string) => void;
}

const StudentNavigation = ({ currentView, onViewChange }: StudentNavigationProps) => {
    return (
        <Routes>
            <Route path="/" element={<StudentDashboard currentView={currentView} onViewChange={onViewChange} />} />
            <Route path="dashboard" element={<StudentDashboard currentView={currentView} onViewChange={onViewChange} />} />
            {/* Add more student routes here, e.g., <Route path="courses" element={<StudentCourses />} /> */}
        </Routes>
    );
};

export default StudentNavigation;