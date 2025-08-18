// frontend/src/pages/tutor/TutorAnalyticsView.tsx

import React from 'react';

const TutorAnalyticsView: React.FC = () => {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mt-6">
                <p className="text-gray-600 dark:text-gray-400">
                    Track your course performance, student engagement, and revenue analytics.
                </p>
            </div>
        </div>
    );
};

export default TutorAnalyticsView;