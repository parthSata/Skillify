import React from 'react';
import { CourseForm } from '@/components/index';
import { useNavigate } from 'react-router-dom';

const AdminCreateCourseView: React.FC = () => {
    const navigate = useNavigate();

    const handleCourseSubmit = (courseData: any) => {
        console.log('Course submitted:', courseData);
        navigate('/admin/courses');
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Create New Course</h1>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                <CourseForm
                    onSubmit={handleCourseSubmit}
                    onCancel={() => navigate('/admin/courses')}
                    isEditing={false}
                />
            </div>
        </div>
    );
};

export default AdminCreateCourseView;