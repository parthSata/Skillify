import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { CourseCard, CourseDetailModal } from '@/components/index';

// Define data interfaces
interface Lecture {
    _id: string;
    title: string;
    duration: string;
    videoUrl: string;
    description: string;
}

// Corrected Course interface to match the API response structure
interface Course {
    _id: string;
    title: string;
    description: string;
    thumbnail: string;
    // FIX: Tutor and category are now populated objects
    tutor: {
        _id: string;
        name: string;
    };
    price: number;
    rating: number;
    students: number;
    duration: string;
    category: {
        _id: string;
        name: string;
    };
    lectures: Lecture[];
    isEnrolled?: boolean;
}

interface CourseCardPropsCourse {
    _id: string;
    title: string;
    description: string;
    thumbnail: string;
    tutor: { _id: string; name: string; };
    price: number;
    rating: number;
    students: number;
    duration: string;
    category: string; // The type expected by CourseCard
    isEnrolled?: boolean;
}

// New interface for category data
interface Category {
    _id: string;
    name: string;
}

interface APIResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

const API_BASE_URL = 'http://localhost:3000/api/v1';

const StudentMyCourses: React.FC = () => {
    const [enrolledCourses, setEnrolledCourses] = useState<CourseCardPropsCourse[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [currentStudentId, setCurrentStudentId] = useState<string | null>(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

    const fetchEnrolledCourses = async () => {
        try {
            setLoading(true);

            const userResponse = await axios.get<APIResponse<{ _id: string }>>(`${API_BASE_URL}/users/me`, { withCredentials: true });
            setCurrentStudentId(userResponse.data.data._id);

            const coursesResponse = await axios.get<APIResponse<{ stats: any, myCourses: Course[] }>>(`${API_BASE_URL}/student/dashboard`, { withCredentials: true });
            const categoriesResponse = await axios.get<APIResponse<Category[]>>(`${API_BASE_URL}/categories`, { withCredentials: true });

            if (coursesResponse.data.success && categoriesResponse.data.success) {
                const fetchedCourses = coursesResponse.data.data.myCourses;

                const formatted = fetchedCourses.map(course => ({
                    ...course,
                    // FIX: Pass the tutor object directly and use null-checks
                    tutor: course.tutor,
                    // FIX: Access the name property of the populated category object
                    category: course.category?.name || 'Uncategorized',
                }));
                setEnrolledCourses(formatted);
                setCategories(categoriesResponse.data.data);

                localStorage.setItem('enrolledCourses', JSON.stringify(fetchedCourses));
            } else {
                setError('Failed to fetch data.');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch data.');
            toast.error(err.response?.data?.message || 'Failed to fetch data.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEnrolledCourses();
    }, []);

    const openCourseModal = async (_id: string) => {
        try {
            const courseResponse = await axios.get<APIResponse<Course>>(`${API_BASE_URL}/courses/${_id}`, { withCredentials: true });
            if (courseResponse.data.success) {
                const courseData = courseResponse.data.data;
                const formattedCourse = {
                    ...courseData,
                    isEnrolled: true,
                    // FIX: Tutor is an object, not a string
                    tutor: courseData.tutor.name,
                    category: (courseData.category as any)?.name || courseData.category,
                    lectures: (courseData.lectures as any[]).map(l => ({ ...l, id: l._id, isLocked: false, isCompleted: false })),
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

    const noopEnroll = () => {
        toast.error("You are already enrolled in this course.");
    };

    const filteredCourses = enrolledCourses.filter(course =>
        selectedCategory === 'All' || course.category === selectedCategory
    );

    if (loading) {
        return <div className="p-6 text-center text-gray-500 dark:text-gray-400">Loading courses...</div>;
    }

    if (error) {
        return <div className="p-6 text-center text-red-500 dark:text-red-400">Error: {error}</div>;
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Courses</h1>
            <div className="flex flex-wrap gap-2 mt-4">
                {['All', ...categories.map(cat => cat.name)].map((categoryName) => (
                    <button
                        key={categoryName}
                        onClick={() => setSelectedCategory(categoryName)}
                        className={`px-4 py-2 rounded-full font-medium transition-all duration-200 ${selectedCategory === categoryName
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                    >
                        {categoryName}
                    </button>
                ))}
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
                {filteredCourses.length > 0 ? (
                    filteredCourses.map((course) => (
                        <CourseCard
                            key={course._id}
                            course={course as any}
                            onCourseClick={() => openCourseModal(course._id)}
                        />
                    ))
                ) : (
                    <div className="col-span-full bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 text-center text-gray-600 dark:text-gray-400">
                        <p>No enrolled courses found in this category.</p>
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
                        tutor: selectedCourse.tutor.name,
                        price: selectedCourse.price,
                        rating: selectedCourse.rating,
                        students: selectedCourse.students,
                        duration: selectedCourse.duration,
                        category: (selectedCourse.category as any)?.name || selectedCourse.category,
                        lectures: selectedCourse.lectures.map(l => ({ ...l, id: l._id, isLocked: false, isCompleted: false })),
                        isEnrolled: true,
                    }}
                    onEnroll={noopEnroll}
                    currentStudentId={currentStudentId}
                />
            )}
        </div>
    );
};

export default StudentMyCourses;