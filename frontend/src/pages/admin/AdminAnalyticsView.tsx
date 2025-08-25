// src/pages/admin/AdminAnalyticsView.tsx

import React, { useState, useEffect } from 'react';
import { Award, Star, Loader2 } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const API_BASE_URL = 'http://localhost:3000/api/v1';
const ITEMS_PER_PAGE = 5;

// Interfaces for API data
interface APIResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

interface TopCourse {
    _id: string;
    title: string;
    tutorName: string;
    totalRevenue: number;
    totalPurchases: number;
}

interface TopTutor {
    _id: string;
    tutorName: string;
    avatar: string;
    totalCourses: number;
    totalRevenue: number;
}

const AdminAnalyticsView: React.FC = () => {
    const [topCourses, setTopCourses] = useState<TopCourse[]>([]);
    const [topTutors, setTopTutors] = useState<TopTutor[]>([]);
    const [loading, setLoading] = useState(true);

    // State for the "Show More" functionality
    const [showAllCourses, setShowAllCourses] = useState(false);
    const [showAllTutors, setShowAllTutors] = useState(false);

    const fetchAnalyticsData = async () => {
        try {
            setLoading(true);
            const [topCoursesResponse, topTutorsResponse] = await Promise.all([
                axios.get<APIResponse<TopCourse[]>>(`${API_BASE_URL}/admin/top-courses`),
                axios.get<APIResponse<TopTutor[]>>(`${API_BASE_URL}/admin/top-tutors`),
            ]);
            setTopCourses(topCoursesResponse.data.data || []);
            setTopTutors(topTutorsResponse.data.data || []);
        } catch (error) {
            console.error('Failed to fetch analytics data:', error);
            toast.error('Failed to load analytics data.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalyticsData();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    // Logic to display limited items or all items
    const coursesToShow = showAllCourses ? topCourses : topCourses.slice(0, ITEMS_PER_PAGE);
    const tutorsToShow = showAllTutors ? topTutors : topTutors.slice(0, ITEMS_PER_PAGE);

    return (
        <div className="p-6 space-y-6">
            {/* Top Courses & Top Tutors Sections */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* Top Courses Section */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-200 dark:border-gray-700">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                        <Star className="w-5 h-5 text-yellow-500 mr-2" />
                        Top Performing Courses
                    </h3>
                    {topCourses.length > 0 ? (
                        <>
                            <ul className="space-y-4">
                                {coursesToShow.map((course, index) => (
                                    <li key={course._id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg flex justify-between items-center">
                                        <div>
                                            <p className="font-semibold text-gray-900 dark:text-white">{index + 1}. {course.title}</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">by {course.tutorName}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                                                ${course.totalRevenue.toLocaleString()}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{course.totalPurchases} purchases</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                            {topCourses.length > ITEMS_PER_PAGE && (
                                <button
                                    onClick={() => setShowAllCourses(!showAllCourses)}
                                    className="mt-4 w-full text-center text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium"
                                >
                                    {showAllCourses ? 'Show Less' : 'Show More'}
                                </button>
                            )}
                        </>
                    ) : (
                        <div className="text-center text-gray-500 dark:text-gray-400">No top courses found.</div>
                    )}
                </div>

                {/* Top Tutors Section */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-200 dark:border-gray-700">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                        <Award className="w-5 h-5 text-yellow-500 mr-2" />
                        Top Performing Tutors
                    </h3>
                    {topTutors.length > 0 ? (
                        <>
                            <ul className="space-y-4">
                                {tutorsToShow.map((tutor, index) => (
                                    <li key={tutor._id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center">
                                        <div className="flex-1">
                                            <p className="font-semibold text-gray-900 dark:text-white">{index + 1}. {tutor.tutorName}</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">{tutor.totalCourses} courses</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                                                ${tutor.totalRevenue.toLocaleString()}
                                            </p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                            {topTutors.length > ITEMS_PER_PAGE && (
                                <button
                                    onClick={() => setShowAllTutors(!showAllTutors)}
                                    className="mt-4 w-full text-center text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium"
                                >
                                    {showAllTutors ? 'Show Less' : 'Show More'}
                                </button>
                            )}
                        </>
                    ) : (
                        <div className="text-center text-gray-500 dark:text-gray-400">No top tutors found.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminAnalyticsView;