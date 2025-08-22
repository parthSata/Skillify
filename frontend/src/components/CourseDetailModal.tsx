import React, { useState, useEffect } from 'react';
import { X, Play, Clock, Users, Star, CheckCircle, Lock } from 'lucide-react';
import VideoPlayer from './VideoPlayer';

interface Lecture {
    id: string;
    title: string;
    duration: string;
    videoUrl: string;
    description: string;
    isCompleted?: boolean;
    isLocked?: boolean;
}

interface Course {
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
    lectures: Lecture[];
    isEnrolled?: boolean;
}

interface CourseDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    course: Course;
    onEnroll: (courseId: string) => void; // Standardizing the prop name to onEnroll
}

const CourseDetailModal: React.FC<CourseDetailModalProps> = ({
    isOpen,
    onClose,
    course,
    onEnroll // Use the updated prop name
}) => {
    const [currentLecture, setCurrentLecture] = useState<Lecture | null>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'lectures' | 'reviews'>('overview');
    const [lectureProgress, setLectureProgress] = useState<Record<string, number>>({});

    useEffect(() => {
        if (isOpen && course.isEnrolled && course.lectures.length > 0) {
            setCurrentLecture(course.lectures[0]);
        }
    }, [isOpen, course]);

    if (!isOpen) return null;

    const handleLectureClick = (lecture: Lecture) => {
        if (course.isEnrolled && !lecture.isLocked) {
            setCurrentLecture(lecture);
        }
    };

    const handleLectureProgress = (lectureId: string, progress: number) => {
        setLectureProgress(prev => ({
            ...prev,
            [lectureId]: progress
        }));
    };

    const handleLectureComplete = (lectureId: string) => {
        console.log('Lecture completed:', lectureId);
    };

    const completedLectures = course.lectures.filter(l => l.isCompleted).length;
    const totalLectures = course.lectures.length;
    const courseProgress = totalLectures > 0 ? (completedLectures / totalLectures) * 100 : 0;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 backdrop-blur-sm pt-4 pb-20 text-center sm:block sm:p-0">
                <div
                    className=" inset-0 transition-opacity bg-opacity-75 "
                    onClick={onClose}
                ></div>
                <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
                <div className="inline-block w-full max-w-6xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-900 shadow-xl rounded-2xl">
                    <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {course.title}
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="flex flex-col lg:flex-row max-h-[80vh] overflow-y-auto">
                        <div className="lg:w-2/3 lg:h-2/3 p-6 flex flex-col space-y-4">
                            {currentLecture ? (
                                <>
                                    <VideoPlayer
                                        videoUrl={currentLecture.videoUrl || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"}
                                        title={currentLecture.title}
                                        thumbnailUrl={course.thumbnail}
                                        onProgress={(progress) => handleLectureProgress(currentLecture.id, progress)}
                                        onComplete={() => handleLectureComplete(currentLecture.id)}
                                    />
                                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                            {currentLecture.title}
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-400">
                                            {currentLecture.description}
                                        </p>
                                    </div>
                                    {course.isEnrolled && (
                                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium text-blue-900 dark:text-blue-300">
                                                    Course Progress
                                                </span>
                                                <span className="text-sm font-medium text-blue-900 dark:text-blue-300">
                                                    {Math.round(courseProgress)}%
                                                </span>
                                            </div>
                                            <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
                                                <div
                                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                                    style={{ width: `${courseProgress}%` }}
                                                ></div>
                                            </div>
                                            <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                                                {completedLectures} of {totalLectures} lectures completed
                                            </p>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="relative">
                                    <img
                                        src={course.thumbnail}
                                        alt={course.title}
                                        className="w-full aspect-video object-cover rounded-xl"
                                    />
                                    <div className="absolute inset-0  bg-opacity-40 flex items-center justify-center rounded-xl">
                                        <div className="text-center text-white">
                                            <Play className="w-16 h-16 mx-auto mb-4 opacity-80" />
                                            <p className="text-lg font-medium">
                                                {course.isEnrolled ? 'Select a lecture to start learning' : 'Enroll to start learning'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="lg:w-1/3 border-l border-gray-200 dark:border-gray-700 p-6 flex flex-col">
                            <div className="flex-1">
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-4">
                                        <div className="flex items-center space-x-1">
                                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">{course.rating}</span>
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
                                    <p className="text-gray-600 dark:text-gray-400">by {course.tutor}</p>
                                    {!course.isEnrolled ? (
                                        <button
                                            onClick={() => onEnroll(course.id)} // Call the onEnroll prop
                                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors duration-200"
                                        >
                                            Enroll Now - {course.price}
                                        </button>
                                    ) : (
                                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                                            <div className="flex items-center space-x-2">
                                                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                                                <span className="text-green-800 dark:text-green-300 font-medium">Enrolled</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="mt-4 border-b border-gray-200 dark:border-gray-700">
                                <nav className="flex">
                                    {[
                                        { id: 'overview', label: 'Overview' },
                                        { id: 'lectures', label: 'Lectures' },
                                        { id: 'reviews', label: 'Reviews' }
                                    ].map((tab) => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id as any)}
                                            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors duration-200 ${activeTab === tab.id
                                                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                                }`}
                                        >
                                            {tab.label}
                                        </button>
                                    ))}
                                </nav>
                            </div>

                            <div className="p-6 overflow-y-auto flex-1">
                                {activeTab === 'overview' && (
                                    <div className="space-y-4">
                                        <div>
                                            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">About this course</h4>
                                            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                                                {course.description}
                                            </p>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">What you'll learn</h4>
                                            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                                                <li className="flex items-start space-x-2">
                                                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                                    <span>Master the fundamentals and advanced concepts</span>
                                                </li>
                                                <li className="flex items-start space-x-2">
                                                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                                    <span>Build real-world projects from scratch</span>
                                                </li>
                                                <li className="flex items-start space-x-2">
                                                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                                    <span>Get hands-on experience with industry tools</span>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'lectures' && (
                                    <div className="space-y-2">
                                        {course.lectures.map((lecture, index) => (
                                            <div
                                                key={lecture.id}
                                                onClick={() => handleLectureClick(lecture)}
                                                className={`p-3 rounded-lg border transition-all duration-200 ${currentLecture?.id === lecture.id
                                                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                                                    : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
                                                    } ${course.isEnrolled && !lecture.isLocked ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'
                                                    }`}
                                            >
                                                <div className="flex items-center space-x-3">
                                                    <div className="flex-shrink-0">
                                                        {lecture.isCompleted ? (
                                                            <CheckCircle className="w-5 h-5 text-green-500" />
                                                        ) : lecture.isLocked ? (
                                                            <Lock className="w-5 h-5 text-gray-400" />
                                                        ) : (
                                                            <Play className="w-5 h-5 text-blue-500" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                            {index + 1}. {lecture.title}
                                                        </p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                                            {lecture.duration}
                                                        </p>
                                                    </div>
                                                </div>
                                                {lectureProgress[lecture.id] > 0 && (
                                                    <div className="mt-2">
                                                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                                                            <div
                                                                className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                                                                style={{ width: `${lectureProgress[lecture.id]}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {activeTab === 'reviews' && (
                                    <div className="space-y-4">
                                        <div className="text-center py-8">
                                            <Star className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                            <p className="text-gray-500 dark:text-gray-400">No reviews yet</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseDetailModal;