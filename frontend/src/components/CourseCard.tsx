import React from 'react';
import { Star, Clock, Users, Play } from 'lucide-react';

interface CourseCardProps {
    course: {
        id: string;
        title: string;
        description: string;
        thumbnail: string;
        tutor: string;
        price: number;
        rating: number;
        students: number;
        duration: string;
        category: string;
    };
    onCourseClick: (courseId: string) => void;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course, onCourseClick }) => {
    return (
        <div
            onClick={() => onCourseClick(course.id)}
            className="group bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden transform hover:-translate-y-1"
        >
            <div className="relative overflow-hidden">
                <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                    <Play className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="absolute top-3 right-3 bg-blue-600 text-white px-2 py-1 rounded-full text-sm font-medium">
                    {course.category}
                </div>
            </div>

            <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {course.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                    {course.description}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">by {course.tutor}</p>

                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">{course.rating}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                            <Users className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">{course.students}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">{course.duration}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">${course.price}</span>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200">
                        Enroll Now
                    </button>
                </div>
            </div>
        </div>
    );
};