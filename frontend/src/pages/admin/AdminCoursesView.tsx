// src/components/AdminCoursesView.tsx

import React, { useState } from 'react';
import { Edit, Trash2, Plus } from 'lucide-react';
import { Modal } from '@/components/Modal';
import { CourseForm } from '@/components';

const AdminCoursesView: React.FC = () => {
    const [showCourseModal, setShowCourseModal] = useState(false);
    const [editingCourse, setEditingCourse] = useState<any>(null);

    const courses = [
        {
            id: '1',
            title: 'Complete React Development',
            tutor: 'John Smith',
            category: 'Web Development',
            students: 234,
            revenue: '$1,200',
            status: 'active',
            thumbnail: 'https://images.pexels.com/photos/11035471/pexels-photo-11035471.jpeg?auto=compress&cs=tinysrgb&w=300',
        },
        {
            id: '2',
            title: 'Python for Beginners',
            tutor: 'Sarah Johnson',
            category: 'Programming',
            students: 456,
            revenue: '$890',
            status: 'pending',
            thumbnail: 'https://images.pexels.com/photos/4164418/pexels-photo-4164418.jpeg?auto=compress&cs=tinysrgb&w=300',
        },
    ];

    const handleCourseSubmit = (courseData: any) => {
        console.log('Course submitted:', courseData);
        setShowCourseModal(false);
        setEditingCourse(null);
    };

    const handleEditCourse = (course: any) => {
        setEditingCourse(course);
        setShowCourseModal(true);
    };

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Course Management</h1>
                <button
                    onClick={() => setShowCourseModal(true)}
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
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Students</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {courses.map((course) => (
                                <tr key={course.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <img src={course.thumbnail} alt={course.title} className="w-12 h-12 object-cover rounded-lg mr-4" />
                                            <div>
                                                <div className="text-sm font-medium text-gray-900 dark:text-white">{course.title}</div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">{course.revenue}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{course.tutor}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{course.category}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{course.students}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${course.status === 'active'
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                                            }`}>
                                            {course.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => handleEditCourse(course)}
                                                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
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
            <Modal
                isOpen={showCourseModal}
                onClose={() => {
                    setShowCourseModal(false);
                    setEditingCourse(null);
                }}
                title={editingCourse ? 'Edit Course' : 'Create New Course'}
                size="xl"
            >
                <CourseForm
                    course={editingCourse}
                    onSubmit={handleCourseSubmit}
                    onCancel={() => {
                        setShowCourseModal(false);
                        setEditingCourse(null);
                    }}
                    isEditing={!!editingCourse}
                />
            </Modal>
        </div>
    );
};

export default AdminCoursesView;