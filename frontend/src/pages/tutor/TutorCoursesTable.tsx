// frontend/src/components/TutorCoursesTable.tsx

import React from 'react';
import { Trash2, Edit, CheckCircle, XCircle } from 'lucide-react';

// Define the shape of a single course object
interface Course {
    _id: string;
    title: string;
    students: number;
    revenue: string;
    rating: number;
    status: string;
    thumbnail: string;
}

// Define the props that this component will accept
interface TutorCoursesTableProps {
    courses: Course[];
    onEdit: (course: Course) => void;
    onToggleStatus: (course: Course) => void;
    onDelete: (course: Course) => void;
    isDashboardView?: boolean;
}

const TutorCoursesTable: React.FC<TutorCoursesTableProps> = ({ courses, onEdit, onToggleStatus, onDelete, isDashboardView }) => {
    console.log("🚀 ~ courses:", courses)

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                            Course
                        </th>
                        {!isDashboardView && (
                            <>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                                    Students
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                                    Revenue
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                                    Rating
                                </th>
                            </>
                        )}
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                            Status
                        </th>
                        <th scope="col" className="relative px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
                    {courses.map((course) => (
                        <tr key={course._id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0 h-10 w-10">
                                        <img className="h-10 w-10 rounded-full object-cover" src={course.thumbnail} alt={course.title} />
                                    </div>
                                    <div className="ml-4">
                                        <div className="text-sm font-medium text-gray-900 dark:text-white">{course.title}</div>
                                    </div>
                                </div>
                            </td>
                            {!isDashboardView && (
                                <>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {course.students || 0}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {course.revenue || '$0'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {course.rating ? course.rating.toFixed(1) : 'N/A'}
                                    </td>
                                </>
                            )}
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${course.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'}`}>
                                    {course.status}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                {/* Status Toggle Button */}
                                <button
                                    onClick={() => onToggleStatus(course)}
                                    className={`p-1 rounded-full transition-colors ${course.status === 'active' ? 'text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20' : 'text-green-500 hover:bg-green-100 dark:hover:bg-green-900/20'}`}
                                >
                                    {course.status === 'active' ? <XCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                                </button>
                                {/* Edit Button */}
                                <button
                                    onClick={() => onEdit(course)}
                                    className="p-1 text-indigo-600 hover:bg-indigo-100 dark:text-indigo-400 dark:hover:bg-indigo-900/20 rounded-full transition-colors"
                                >
                                    <Edit className="w-5 h-5" />
                                </button>
                                {/* Delete Button */}
                                <button
                                    onClick={() => onDelete(course)}
                                    className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-full transition-colors"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default TutorCoursesTable;