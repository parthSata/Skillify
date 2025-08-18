// src/components/AdminCoursesView.tsx

import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Plus, Loader2 } from 'lucide-react';
import { Modal } from '@/components/Modal';
import { CourseForm, ConfirmationDialog } from '@/components/index';
import axios from 'axios';
import { toast } from 'react-hot-toast';

interface Course {
    _id: string;
    title: string;
    tutor: { name: string };
    category: { name: string };
    students: number;
    revenue: string;
    thumbnail: string;
}

interface ApiResponse<T> {
    data: T;
    message: string;
    success: boolean;
}

axios.defaults.withCredentials = true;
const API_BASE_URL = 'http://localhost:3000/api/v1';

const AdminCoursesView: React.FC = () => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCourseModal, setShowCourseModal] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [editingCourse, setEditingCourse] = useState<any>(null);
    const [courseToDeleteId, setCourseToDeleteId] = useState<string | null>(null);

    const fetchCourses = async () => {
        try {
            setLoading(true);
            const response = await axios.get<ApiResponse<Course[]>>(`${API_BASE_URL}/courses`);
            setCourses(response.data.data || []);
        } catch (err: any) {
            setCourses([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    const handleCourseSubmit = async (courseData: FormData) => {
        try {
            if (editingCourse) {
                await axios.patch(`${API_BASE_URL}/courses/${editingCourse._id}`, courseData);
                toast.success('Course updated successfully!');
            } else {
                await axios.post(`${API_BASE_URL}/courses/create-course`, courseData);
                toast.success('Course created successfully!');
            }
            setShowCourseModal(false);
            setEditingCourse(null);
            fetchCourses();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to save course.');
        }
    };

    const handleEditCourse = (course: any) => {
        setEditingCourse(course);
        setShowCourseModal(true);
    };

    const handleDeleteClick = (courseId: string) => {
        setCourseToDeleteId(courseId);
        setShowDeleteDialog(true);
    };

    const confirmDelete = async () => {
        if (!courseToDeleteId) return;
        try {
            await axios.delete(`${API_BASE_URL}/courses/${courseToDeleteId}`);
            toast.success('Course deleted successfully!');
            fetchCourses();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to delete course.');
        } finally {
            setShowDeleteDialog(false);
            setCourseToDeleteId(null);
        }
    };

    const cancelDelete = () => {
        setShowDeleteDialog(false);
        setCourseToDeleteId(null);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="p-6 bg-red">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white dark:bg-red">Course Management</h1>
                <button
                    onClick={() => {
                        setEditingCourse(null);
                        setShowCourseModal(true);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                >
                    <Plus className="w-5 h-5" />
                    <span>Add Course</span>
                </button>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Course</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tutor</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {courses?.map((course) => (
                                <tr key={course._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <img src={course.thumbnail} alt={course.title} className="w-12 h-12 object-cover rounded-lg mr-4" />
                                            <div>
                                                <div className="text-sm font-medium text-gray-900 dark:text-white">{course.title}</div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">{course.students} students</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{course.tutor.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{course.category.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex items-center space-x-2">
                                            <button onClick={() => handleEditCourse(course)} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDeleteClick(course._id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {showCourseModal && (
                <Modal isOpen={showCourseModal} onClose={() => setShowCourseModal(false)} title={editingCourse ? 'Edit Course' : 'Create New Course'} size="xl">
                    <CourseForm course={editingCourse} onSubmit={handleCourseSubmit} onCancel={() => setShowCourseModal(false)} isEditing={!!editingCourse} />
                </Modal>
            )}c
            {showDeleteDialog && (
                <ConfirmationDialog title="Confirm Deletion" message="Are you sure you want to delete this course? This action cannot be undone." onConfirm={confirmDelete} onCancel={cancelDelete} />
            )}
        </div>
    );
};

export default AdminCoursesView;