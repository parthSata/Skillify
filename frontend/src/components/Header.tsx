// src/components/Header.tsx

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Menu,
    ChevronDown,
    LogOut,
    BookOpen,
    TrendingUp,
    Tag,
    PlusCircle,
    Search,
    Home,
    Users,
    Settings,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Header: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    // Do not render the header if the user is not authenticated.
    if (!user) {
        return null;
    }

    const userType = user.role;
    const getMenuItems = () => {
        switch (userType) {
            case 'admin':
                return [
                    { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/admin/dashboard' },
                    { id: 'tutors', label: 'Tutors', icon: Users, path: '/admin/tutors' },
                    { id: 'students', label: 'Students', icon: Users, path: '/admin/students' },
                    { id: 'courses', label: 'Courses', icon: BookOpen, path: '/admin/courses' },
                    { id: 'categories', label: 'Categories', icon: Tag, path: '/admin/categories' },
                    { id: 'analytics', label: 'Analytics', icon: Settings, path: '/admin/analytics' },
                ];
            case 'tutor':
                return [
                    { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/tutor/dashboard' },
                    { id: 'my-courses', label: 'My Courses', icon: BookOpen, path: '/tutor/courses' },
                    { id: 'create-course', label: 'Create Course', icon: PlusCircle, path: '/tutor/create-course' },
                    { id: 'categories', label: 'Categories', icon: Tag, path: '/tutor/categories' },
                    { id: 'analytics', label: 'Analytics', icon: TrendingUp, path: '/tutor/analytics' },
                ];
            case 'student':
                return [
                    { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/student/dashboard' },
                    { id: 'browse', label: 'Browse Courses', icon: Search, path: '/student/browse' },
                    { id: 'my-courses', label: 'My Courses', icon: BookOpen, path: '/student/my-courses' },
                    { id: 'progress', label: 'Progress', icon: TrendingUp, path: '/student/progress' },
                ];
            default:
                return [];
        }
    };

    const menuItems = getMenuItems();
    const currentPath = location.pathname;

    const handleNavigation = (path: string) => {
        navigate(path);
        setIsMobileMenuOpen(false);
    };

    const handleLogout = () => {
        logout(navigate);
        navigate('/login');
        setIsUserMenuOpen(false);
    };

    return (
        <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50">
            <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <span
                        className="text-2xl font-bold text-blue-600 dark:text-blue-400"
                    >
                        LMS
                    </span>

                    <nav className="hidden md:flex space-x-1">
                        {menuItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => handleNavigation(item.path)}
                                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${currentPath.startsWith(item.path)
                                        ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                                    }`}
                            >
                                <item.icon className="w-5 h-5" />
                                <span className="font-medium">{item.label}</span>
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="flex items-center space-x-2">
                    <div className="relative hidden md:block">
                        <button
                            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                            className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                            <div className="bg-blue-600 w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold">
                                {user.name ? user.name[0].toUpperCase() : user.role[0].toUpperCase()}
                            </div>
                            <ChevronDown
                                className={`w-4 h-4 text-gray-500 dark:text-gray-400 transform transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : 'rotate-0'
                                    }`}
                            />
                        </button>
                        {isUserMenuOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-lg shadow-xl py-2 z-10">
                                <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                                    <p className="font-semibold">{user.name || 'User'}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{userType}</p>
                                </div>
                                <hr className="my-2 border-gray-200 dark:border-gray-600" />
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                                >
                                    <LogOut className="w-4 h-4 mr-2" />
                                    Log Out
                                </button>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="md:hidden text-gray-500 dark:text-gray-400 focus:outline-none"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                </div>
            </div>

            {isMobileMenuOpen && (
                <div className="md:hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                    <nav className="p-4 flex flex-col space-y-1">
                        {menuItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => handleNavigation(item.path)}
                                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${currentPath.startsWith(item.path)
                                        ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                                    }`}
                            >
                                <item.icon className="w-5 h-5" />
                                <span className="font-medium">{item.label}</span>
                            </button>
                        ))}
                        <hr className="my-2 border-gray-200 dark:border-gray-600" />
                        <button
                            onClick={handleLogout}
                            className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            Log Out
                        </button>
                    </nav>
                </div>
            )}
        </header>
    );
};

export default Header;