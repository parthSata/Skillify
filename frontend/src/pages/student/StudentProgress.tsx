import React, { useState, useEffect } from 'react';
import { CheckCircle, Trophy, BookOpen } from 'lucide-react';

// Define the core types needed for this component
interface Lecture {
    id: string;
    duration: string;
    title: string;
    videoUrl: string;
}

interface Course {
    _id: string;
    title: string;
    lectures: Lecture[];
}

interface CourseProgressData {
    id: string;
    title: string;
    completedLectures: number;
    totalLectures: number;
}

const StudentProgress: React.FC = () => {
    // State to hold the dynamic progress data
    const [progressData, setProgressData] = useState<CourseProgressData[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // This effect runs once to load the progress data from local storage
    useEffect(() => {
        setIsLoading(true);

        const storedCourses = localStorage.getItem('enrolledCourses');
        const enrolledCourses: Course[] = storedCourses ? JSON.parse(storedCourses) : [];

        const processedData: CourseProgressData[] = enrolledCourses.map(course => {
            const completedLectureIds = JSON.parse(localStorage.getItem(`course-progress-${course._id}`) || '[]');
            return {
                id: course._id,
                title: course.title,
                completedLectures: completedLectureIds.length,
                totalLectures: course.lectures.length,
            };
        });

        setTimeout(() => {
            setProgressData(processedData);
            setIsLoading(false);
        }, 500);
    }, []);

    const overallProgress = progressData.length > 0 ? progressData.reduce((acc, course) => acc + (course.completedLectures / course.totalLectures), 0) / progressData.length : 0;
    const isOverallComplete = progressData.length > 0 && progressData.every(course => course.completedLectures === course.totalLectures);

    return (
        <div className="p-6 bg-gray-100 dark:bg-gray-950 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">My Progress</h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-6">
                View your learning analytics, achievements, and course completion status.
            </p>

            {isLoading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-500 dark:text-gray-400">Loading your progress...</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {/* Overall Progress Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                                <Trophy className="w-8 h-8 text-yellow-500 flex-shrink-0" />
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Overall Progress</h2>
                            </div>
                            <span className={`text-xl font-bold ${isOverallComplete ? 'text-green-500' : 'text-blue-600 dark:text-blue-400'}`}>
                                {Math.round(overallProgress * 100)}%
                            </span>
                        </div>
                        <div className="w-full bg-blue-100 dark:bg-blue-800 rounded-full h-3">
                            <div
                                className={`h-full rounded-full transition-all duration-500 ${isOverallComplete ? 'bg-green-500' : 'bg-blue-600'}`}
                                style={{ width: `${overallProgress * 100}%` }}
                            ></div>
                        </div>
                        {isOverallComplete && (
                            <p className="mt-4 text-sm text-green-600 dark:text-green-400 font-medium flex items-center space-x-1">
                                <CheckCircle className="w-4 h-4" />
                                <span>Congratulations! All courses completed.</span>
                            </p>
                        )}
                    </div>

                    {/* Individual Course Progress Cards */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {progressData.length > 0 ? (
                            progressData.map((course) => {
                                const percentage = (course.completedLectures / course.totalLectures) * 100;
                                const isCompleted = course.completedLectures === course.totalLectures;
                                return (
                                    <div
                                        key={course.id}
                                        className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
                                    >
                                        <div className="flex items-center space-x-3 mb-3">
                                            <BookOpen className="w-6 h-6 text-blue-500" />
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                                                {course.title}
                                            </h3>
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                            {course.completedLectures} of {course.totalLectures} lectures completed
                                        </p>
                                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                            <div
                                                className={`h-full rounded-full transition-all duration-300 ${isCompleted ? 'bg-green-500' : 'bg-blue-600'}`}
                                                style={{ width: `${percentage}%` }}
                                            ></div>
                                        </div>
                                        {isCompleted && (
                                            <div className="mt-3 flex items-center space-x-1 text-sm font-medium text-green-600 dark:text-green-400">
                                                <CheckCircle className="w-4 h-4" />
                                                <span>Completed!</span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        ) : (
                            <p className="col-span-full text-center text-gray-600 dark:text-gray-400">
                                You haven't started any courses yet.
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentProgress;