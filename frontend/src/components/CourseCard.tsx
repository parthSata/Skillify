// frontend/src/components/CourseCard.tsx

import React from 'react';

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
                        <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.518-1.812a1 1 0 00-1.202 0l-2.518 1.812c-.785.57-1.83-.197-1.539-1.118l1.07-3.292a1 1 0 00-.363-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.95-.69l1.07-3.292z" />
                        </svg>
                        <span className="text-sm text-gray-700 dark:text-gray-300">{course.rating}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">({course.students}+)</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">₹{course.price}</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>{course.duration}</span>
                    {course.lectures && <span>{course.lectures.length} Lectures</span>}
                </div>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Tutor: {course.tutor.name}</p>
            </div>
        </div>
    );
};

export default CourseCard;