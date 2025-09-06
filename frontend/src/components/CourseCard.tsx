import React from 'react';
import { Star } from 'lucide-react'; // You were using an SVG, but you have Lucide icons available. Let's use the Lucide Star icon.

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
    category: string;
    lectures?: any[];
}

interface CourseCardProps {
    course: Course;
    onCourseClick: (id: string) => void;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, onCourseClick }) => {
    return (
        <div
            onClick={() => onCourseClick(course._id)}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-shadow hover:shadow-lg cursor-pointer"
        >
            <div className="relative">
                <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-48 object-cover"
                />
                {course.category && (
                    <div className="absolute top-2 right-2 bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full dark:bg-blue-900 dark:text-blue-300">
                        {course.category}
                    </div>
                )}
            </div>
            <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">{course.title}</h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{course.description}</p>
                <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{course.rating}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">({course.students}+)</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">₹{course.price}</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                    {/* Add null-check for course.duration */}
                    {course.duration && <span>{course.duration}</span>}
                    {/* Add null-check for course.lectures */}
                    {course.lectures && <span>{course.lectures.length} Lectures</span>}
                </div>
                {/* FIX: Add null-check for the tutor object */}
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Tutor: {course.tutor?.name || 'N/A'}</p>
            </div>
        </div>
    );
};

export default CourseCard;