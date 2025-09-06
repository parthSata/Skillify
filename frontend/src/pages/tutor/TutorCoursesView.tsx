// frontend/src/pages/tutor/TutorCoursesView.tsx

import React, { useState, useEffect } from 'react';
import { TutorCoursesTable, CourseForm } from '@/components/index';
import { ConfirmationDialog } from '@/components/ConfirmationDialog';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Plus } from 'lucide-react';
import { Modal } from '@/components/Modal';

const API_BASE_URL = 'http://localhost:3000/api/v1';

// Define the API response structure
interface APIResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

// Define the Course interface from the API with dynamic fields
interface API_Course {
    _id: string;
    title: string;
    description: string;
    category: {
        _id: string;
        name: string;
    };
    tutor: {
        _id: string;
        name: string;
    };
    price: number;
    thumbnail: string;
    lectures: any[];
    isApproved: boolean;
    students: number;
    revenue: number;
    rating: number;
}

// Define the interface for the component's state and props
interface ComponentCourse {
    _id: string;
    title: string;
    students: number;
    revenue: string;
    rating: number;
    status: string;
    thumbnail: string;
}

const TutorCoursesView: React.FC = () => {
    const [courses, setCourses] = useState<ComponentCourse[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // State for the modals and dialogs
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCourse, setEditingCourse] = useState<API_Course | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [courseToDelete, setCourseToDelete] = useState<ComponentCourse | null>(null);

    const fetchTutorCourses = async () => {
        try {
            setLoading(true);
            const response = await axios.get<APIResponse<API_Course[]>>(
                `${API_BASE_URL}/tutor/courses`
            );

            if (response.data.success) {
                const formattedCourses: ComponentCourse[] = response.data.data.map((course) => ({
                    _id: course._id,
                    title: course.title,
                    students: course.students,
                    revenue: new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(course.revenue),
                    rating: course.rating || 0,
                    status: course.isApproved ? 'active' : 'pending',
                    thumbnail: course.thumbnail,
                }));
                setCourses(formattedCourses);
                setError(null);
            } else {
                setError(response.data.message || 'Failed to fetch courses.');
            }
        } catch (err: any) {
            console.error('Failed to fetch tutor courses:', err);
            setError(err.response?.data?.message || 'Failed to fetch courses.');
            toast.error(err.response?.data?.message || 'Failed to fetch courses.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTutorCourses();
    }, []);

    const handleEditCourse = async (course: ComponentCourse) => {
        try {
            const response = await axios.get<APIResponse<API_Course>>(`${API_BASE_URL}/tutor/courses/${course._id}`);
            if (response.data.success) {
                setEditingCourse(response.data.data);
                setIsModalOpen(true);
            } else {
                toast.error(response.data.message || 'Failed to fetch course details.');
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to fetch course details.');
        }
    };

    const handleFormSubmit = async (courseData: FormData) => {
        try {
            let response;
            if (editingCourse) {
                response = await axios.patch<APIResponse<API_Course>>(
                    `${API_BASE_URL}/tutor/courses/${editingCourse._id}`,
                    courseData
                );
            } else {
                response = await axios.post<APIResponse<API_Course>>(
                    `${API_BASE_URL}/tutor/courses`,
                    courseData
                );
            }

            if (response.data.success) {
                toast.success(`Course ${editingCourse ? 'updated' : 'created'} successfully!`);
                closeModal();
                fetchTutorCourses(); // Refresh the list
            } else {
                toast.error(response.data.message || 'Failed to save course.');
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to save course.');
        }
    };

    const handleToggleStatus = async (course: ComponentCourse) => {
        try {
            const newStatus = course.status === 'active' ? 'pending' : 'active';
            const response = await axios.patch<APIResponse<API_Course>>(
                `${API_BASE_URL}/tutor/courses/${course._id}/status`,
                { isApproved: newStatus === 'active' }
            );

            if (response.data.success) {
                toast.success(`Course status updated to '${newStatus}'!`);
                fetchTutorCourses(); // Refresh the list
            } else {
                toast.error(response.data.message || 'Failed to update course status.');
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to update course status.');
        }
    };

    const handleDeleteCourse = (course: ComponentCourse) => {
        setCourseToDelete(course);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!courseToDelete) return;
        try {
            const response = await axios.delete<APIResponse<any>>(`${API_BASE_URL}/tutor/courses/${courseToDelete._id}`);
            if (response.data.success) {
                toast.success('Course deleted successfully!');
                fetchTutorCourses(); // Refresh the list
            } else {
                toast.error(response.data.message || 'Failed to delete course.');
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to delete course.');
        } finally {
            setIsDeleteDialogOpen(false);
            setCourseToDelete(null);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingCourse(null);
    };

    if (loading) {
        return <div className="p-6 text-center text-gray-500 dark:text-gray-400">Loading courses...</div>;
    }

    if (error) {
        return <div className="p-6 text-center text-red-500 dark:text-red-400">Error: {error}</div>;
    }

    if (courses.length === 0) {
        return (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                <p className="mb-4">You don't have any courses yet.</p>
                <button
                    onClick={() => {
                        setEditingCourse(null);
                        setIsModalOpen(true);
                    }}
                    className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors mx-auto"
                >
                    <Plus className="w-4 h-4" />
                    <span>Create Your First Course</span>
                </button>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Courses</h1>
                <button
                    onClick={() => {
                        setEditingCourse(null);
                        setIsModalOpen(true);
                    }}
                    className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    <span>New Course</span>
                </button>
            </div>
            <TutorCoursesTable
                courses={courses}
                onEdit={handleEditCourse}
                onToggleStatus={handleToggleStatus}
                onDelete={handleDeleteCourse}
            />

            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={editingCourse ? "Edit Course" : "Create New Course"}
                size="xl"
            >
                <CourseForm
                    course={editingCourse as any}
                    onSubmit={handleFormSubmit}
                    onCancel={closeModal}
                    isEditing={!!editingCourse}
                />
            </Modal>

            <ConfirmationDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={confirmDelete}
                title="Confirm Deletion"
                message={`Are you sure you want to delete the course "${courseToDelete?.title}"? This action cannot be undone.`}
            />
        </div>
    );
};

export default TutorCoursesView;