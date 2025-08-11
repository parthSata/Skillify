// src/components/DashboardLayout.tsx
import React from 'react';
import Header from './Header'; // Adjust the path as needed

interface DashboardLayoutProps {
    children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            <Header />
            <main className="container mx-auto px-4 py-6">
                {children}
            </main>
        </div>
    );
};

export default DashboardLayout;