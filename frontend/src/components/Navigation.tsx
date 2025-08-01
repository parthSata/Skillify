import React from "react";
import { GraduationCap, Home, BookOpen, Users, Settings, LogOut, Tag } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";  // Assuming you have this component
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface NavigationProps {
  currentView: string;
  onViewChange: (view: string) => void;
  userType: "admin" | "tutor" | "student";
}

 const Navigation: React.FC<NavigationProps> = ({ currentView, onViewChange, userType }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      alert("Failed to log out. Please try again.");
    }
  };

  const getMenuItems = () => {
    switch (userType) {
      case "admin":
        return [
          { id: "dashboard", label: "Dashboard", icon: Home },
          { id: "students", label: "Students", icon: Users },
          { id: "tutors", label: "Tutors", icon: Users },
          { id: "courses", label: "Courses", icon: BookOpen },
          { id: "categories", label: "Categories", icon: Tag },
          { id: "analytics", label: "Analytics", icon: Settings },
        ];
      case "tutor":
        return [
          { id: "dashboard", label: "Dashboard", icon: Home },
          { id: "courses", label: "My Courses", icon: BookOpen },
          { id: "create-course", label: "Create Course", icon: BookOpen },
          { id: "categories", label: "Categories", icon: Tag },
          { id: "analytics", label: "Analytics", icon: Settings },
        ];
      case "student":
        return [
          { id: "dashboard", label: "Dashboard", icon: Home },
          { id: "browse", label: "Browse Courses", icon: BookOpen },
          { id: "my-courses", label: "My Courses", icon: BookOpen },
          { id: "progress", label: "Progress", icon: Settings },
        ];
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-lg border-r border-gray-200 dark:border-gray-700">
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">EduPlatform</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{userType} Panel</p>
            </div>
          </div>
          <ThemeToggle />
        </div>

        <div className="flex-1 px-4 py-6 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${currentView === item.id
                  ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              type="button"
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
            type="button"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;