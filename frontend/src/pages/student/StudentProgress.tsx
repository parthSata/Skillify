import React from 'react';

const StudentProgress: React.FC = () => {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Progress</h1>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mt-4">
                <p className="text-gray-600 dark:text-gray-400">
                    View your learning analytics, achievements, and course completion status.
                </p>
            </div>
        </div>
    );
};

export default StudentProgress;