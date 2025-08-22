import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { CourseCard, CourseDetailModal } from '@/components/index';

const API_BASE_URL = 'http://localhost:3000/api/v1';

// Define data interfaces
interface Course {
    _id: string;
    title: string;
    description: string;
    thumbnail: string;
    tutor: {
        _id: string;
        name: string;
    };
    price: number;
    rating: number;
    students: number;
    duration: string;
    category: string; // Ensure this is a string to match the updated UI logic
    lectures: any[];
    isEnrolled?: boolean;
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

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

    const fetchEnrolledCourses = async () => {
        try {
            setLoading(true);
            const response = await axios.get<APIResponse<Course[]>>(`${API_BASE_URL}/student/my-courses`);

            if (response.data.success) {
                // Ensure the category is a string if it comes as an object from the API
                const formattedCourses = response.data.data.map(course => ({
                    ...course,
                    category: (course.category as any)?.name || course.category,
                }));
                setEnrolledCourses(formattedCourses);
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

    useEffect(() => {
        fetchEnrolledCourses();
    }, []);

    const openCourseModal = async (_id: string) => {
        try {
            const courseResponse = await axios.get<APIResponse<Course>>(`${API_BASE_URL}/courses/${_id}`);
            if (courseResponse.data.success) {
                const formattedCourse = {
                    ...courseResponse.data.data,
                    isEnrolled: true,
                    // Ensure tutor is a string for the modal
                    tutor: (courseResponse.data.data.tutor as any).name,
                    // Map _id to id for lectures
                    lectures: (courseResponse.data.data.lectures as any[]).map(l => ({
                        ...l,
                        id: l._id,
                        isLocked: false,
                        isCompleted: false
                    })),
                };
                setSelectedCourse(formattedCourse as any);
                setIsModalOpen(true);
            } else {
                toast.error("Failed to load course details for modal.");
            }
        } catch (err) {
            toast.error("An error occurred while fetching course details.");
            console.error(err);
        }
    };

    const closeCourseModal = () => {
        setIsModalOpen(false);
        setSelectedCourse(null);
    };

    // A dummy function for the onEnroll prop since these courses are already enrolled
    const noopEnroll = () => {
        toast.error("You are already enrolled in this course.");
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
                            key={course._id}
                            course={course}
                            onCourseClick={() => openCourseModal(course._id)}
                        />
                    ))
                ) : (
                    <div className="col-span-full bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 text-center text-gray-600 dark:text-gray-400">
                        <p>You are not enrolled in any courses yet.</p>
                        <p className="mt-2">Browse the course catalog to get started!</p>
                    </div>
                )}
            </div>

            {selectedCourse && (
                <CourseDetailModal
                    isOpen={isModalOpen}
                    onClose={closeCourseModal}
                    course={{
                        id: selectedCourse._id,
                        title: selectedCourse.title,
                        description: selectedCourse.description,
                        thumbnail: selectedCourse.thumbnail,
                        tutor: selectedCourse.tutor.name, // <-- FIX: Access the name property
                        price: selectedCourse.price,
                        rating: selectedCourse.rating,
                        students: selectedCourse.students,
                        duration: selectedCourse.duration,
                        category: selectedCourse.category,
                        lectures: selectedCourse.lectures.map(l => ({ ...l, id: l._id, isLocked: false, isCompleted: false })),
                        isEnrolled: true,
                    }}
                    onEnroll={noopEnroll} // Pass the dummy function to satisfy the prop requirement
                />
            )}
        </div>
    );
};

export default StudentMyCourses;