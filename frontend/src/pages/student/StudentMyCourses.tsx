// src/pages/StudentMyCourses.tsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { CourseCard } from '@/components/index';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:3000/api/v1';

// Define data interfaces
interface Course {
    _id: string; // Changed from 'id' to '_id'
    title: string;
    description: string;
    thumbnail: string;
    tutor: { // Updated to be an object to match populated data
        _id: string;
        name: string;
    };
    price: number;
    rating: number;
    students: number;
    duration: string;
    category: string;
    lectures: any[];
}

interface APIResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

const StudentMyCourses: React.FC = () => {
    const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchEnrolledCourses = async () => {
            try {
                setLoading(true);
                const response = await axios.get<APIResponse<Course[]>>(`${API_BASE_URL}/student/my-courses`);

                if (response.data.success) {
                    setEnrolledCourses(response.data.data);
                } else {
                    setError('Failed to fetch enrolled courses.');
                }
            } catch (err: any) {
                setError(err.response?.data?.message || 'Failed to fetch enrolled courses.');
                toast.error(err.response?.data?.message || 'Failed to fetch enrolled courses.');
            } finally {
                setLoading(false);
            }
        };

        fetchEnrolledCourses();
    }, []);

    const handleCourseClick = (courseId: string) => {
        navigate(`/student/course-details/${courseId}`);
    };

    if (loading) {
        return <div className="p-6 text-center text-gray-500 dark:text-gray-400">Loading courses...</div>;
    }

    if (error) {
        return <div className="p-6 text-center text-red-500 dark:text-red-400">Error: {error}</div>;
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Courses</h1>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
                {enrolledCourses.length > 0 ? (
                    enrolledCourses.map((course) => (
                        <CourseCard
                            key={course._id} // Fixed to use _id
                            course={course}
                            onCourseClick={() => handleCourseClick(course._id)}
                        />
                    ))
                ) : (
                    <div className="col-span-full bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 text-center text-gray-600 dark:text-gray-400">
                        <p>You are not enrolled in any courses yet.</p>
                        <p className="mt-2">Browse the course catalog to get started!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentMyCourses;