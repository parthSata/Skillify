import React, { useState, useEffect } from 'react';
import { BookOpen, Clock, Award, Users } from 'lucide-react';

// Define the interfaces for the data fetched from the API
interface StudentStats {
    totalEnrolledCourses: number;
    completedCourses: number;
    coursesInProgress: number;
    totalCertificates: number;
}

interface EnrolledCourse {
    _id: string;
    title: string;
    progress: number;
    nextLesson: string;
    status: 'completed' | 'in-progress' | 'not-started';
}

// Define the shape of the API response
interface ApiResponse {
    success: boolean;
    data: {
        stats: StudentStats;
        myCourses: EnrolledCourse[];
    };
    message: string;
}

// API endpoint for the student dashboard
const API_URL = 'http://localhost:3000/api/v1/student/dashboard';

const StudentDashboardHome: React.FC = () => {
    const [stats, setStats] = useState<StudentStats | null>(null);
    const [myCourses, setMyCourses] = useState<EnrolledCourse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Function to fetch data from the API
    const fetchStudentData = async () => {
        setLoading(true);
        setError(null);

        // Fetch options with credentials to send cookies
        const fetchOptions = {
            credentials: 'include' as RequestCredentials,
        };

        try {
            const response = await fetch(API_URL, fetchOptions);
            if (!response.ok) {
                let errorMessage = `HTTP error! status: ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorMessage;
                } catch (jsonError) {
                    // Ignore JSON parsing errors and use the original HTTP error
                }
                throw new Error(errorMessage);
            }
            const result: ApiResponse = await response.json();
            if (result.success && result.data) {
                setStats(result.data.stats);
                setMyCourses(result.data.myCourses);
            } else {
                setError(result.message);
            }
        } catch (e: any) {
            console.error("Failed to fetch student dashboard data:", e);
            setError(e.message || "An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    // Fetch data on component mount
    useEffect(() => {
        fetchStudentData();
    }, []);

    // Helper to determine icon based on stat title
    const getIconAndColor = (title: string) => {
        switch (title) {
            case 'Enrolled Courses': return { icon: BookOpen, color: 'blue' };
            case 'Completed': return { icon: Award, color: 'green' };
            case 'In Progress': return { icon: Clock, color: 'orange' };
            case 'Certificates': return { icon: Award, color: 'purple' };
            default: return { icon: Users, color: 'gray' };
        }
    };

    // Helper to format stat data for the UI
    // This is now derived directly in the JSX, making it more robust
    const studentStatsDisplay = stats ? [
        { title: 'Enrolled Courses', value: stats.totalEnrolledCourses, icon: getIconAndColor('Enrolled Courses').icon, color: getIconAndColor('Enrolled Courses').color },
        { title: 'Completed', value: stats.completedCourses, icon: getIconAndColor('Completed').icon, color: getIconAndColor('Completed').color },
        { title: 'In Progress', value: stats.coursesInProgress, icon: getIconAndColor('In Progress').icon, color: getIconAndColor('In Progress').color },
        { title: 'Certificates', value: stats.totalCertificates, icon: getIconAndColor('Certificates').icon, color: getIconAndColor('Certificates').color },
    ] : [];

    // Loading State
    if (loading) {
        return <div className="p-6 text-center text-gray-500">Loading dashboard data...</div>;
    }

    // Error State
    if (error) {
        return <div className="p-6 text-center text-red-500">Error: {error}</div>;
    }

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome back, Student!</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Continue your learning journey</p>
            </div>

            {/* Student Stats Section */}
            <div className="grid md:grid-cols-4 gap-6">
                {studentStatsDisplay.length > 0 ? (
                    studentStatsDisplay.map((stat, index) => (
                        <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{stat.title}</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</p>
                                </div>
                                <div className={`p-3 rounded-full bg-${stat.color}-100 dark:bg-${stat.color}-900/20`}>
                                    <stat.icon className={`w-6 h-6 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full text-center text-gray-500 dark:text-gray-400">No statistics available.</div>
                )}
            </div>

            {/* Continue Learning Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Continue Learning</h3>
                <div className="space-y-4">
                    {myCourses?.length > 0 ? (
                        myCourses.map((item, index) => (
                            <div key={item._id || index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-medium text-gray-900 dark:text-white">{item.title}</h4>
                                    <span className="text-sm text-gray-500 dark:text-gray-400">{item.progress}%</span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                                    <div
                                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${item.progress}%` }}
                                    ></div>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Next: {item.nextLesson}</p>
                            </div>
                        ))
                    ) : (
                        <div className="text-center text-gray-500 dark:text-gray-400 py-10">You are not enrolled in any courses yet.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentDashboardHome;