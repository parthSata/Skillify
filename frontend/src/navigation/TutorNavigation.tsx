import { Routes, Route } from "react-router-dom";
import { TutorDashboard } from "@/components/index";

interface TutorNavigationProps {
    currentView: string;
    onViewChange: (view: string) => void;
}

const TutorNavigation = ({ currentView, onViewChange }: TutorNavigationProps) => {
    return (
        <Routes>
            <Route path="/" element={<TutorDashboard currentView={currentView} onViewChange={onViewChange} />} />
            <Route path="dashboard" element={<TutorDashboard currentView={currentView} onViewChange={onViewChange} />} />
            {/* Add more tutor routes here, e.g., <Route path="courses" element={<TutorCourses />} /> */}
        </Routes>
    );
};

export default TutorNavigation;