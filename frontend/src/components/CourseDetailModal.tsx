import React, { useState, useEffect } from 'react';
import { X, Play, Clock, Users, Star, CheckCircle, Lock, ChevronDown, ChevronUp, Edit, Trash2 } from 'lucide-react';
import VideoPlayer from './VideoPlayer';
import moment from 'moment';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { ConfirmationDialog } from './ConfirmationDialog'; // Import the ConfirmationDialog

const API_BASE_URL = 'http://localhost:3000/api/v1';

interface APIResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

interface Review {
    _id: string;
    student: {
        _id: string;
        name: string;
    };
    rating: number;
    comment: string;
    createdAt: string;
}

interface Lecture {
    id: string;
    title: string;
    duration: string;
    videoUrl: string;
    description: string;
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
    onEnroll: (courseId: string) => void;
    currentStudentId: string | null;
}

const REVIEWS_PER_PAGE = 5;

const CourseDetailModal: React.FC<CourseDetailModalProps> = ({
    isOpen,
    onClose,
    course,
    onEnroll,
    currentStudentId
}) => {
    const [currentLecture, setCurrentLecture] = useState<Lecture | null>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'lectures' | 'reviews'>('overview');
    const [completedLectureIds, setCompletedLectureIds] = useState<string[]>([]);
    const [lectureProgress, setLectureProgress] = useState<Record<string, number>>({});

    const [reviews, setReviews] = useState<Review[]>([]);
    const [totalReviews, setTotalReviews] = useState(0);
    const [myRating, setMyRating] = useState(0);
    const [myComment, setMyComment] = useState('');
    const [hasMyReview, setHasMyReview] = useState(false);
    const [isReviewLoading, setIsReviewLoading] = useState(false);

    const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
    const [myReviewId, setMyReviewId] = useState<string | null>(null);

    const [visibleReviewsCount, setVisibleReviewsCount] = useState(REVIEWS_PER_PAGE);

    // NEW: State for the confirmation dialog
    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
    const [reviewToDeleteId, setReviewToDeleteId] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && course.isEnrolled && course.lectures.length > 0) {
            setCurrentLecture(course.lectures[0]);
            const savedCompleted = JSON.parse(localStorage.getItem(`course-progress-${course.id}`) || '[]');
            setCompletedLectureIds(savedCompleted);
        }
    }, [isOpen, course]);

    useEffect(() => {
        if (isOpen && activeTab === 'reviews' && course.id) {
            fetchReviews();
        }
        if (activeTab !== 'reviews') {
            setVisibleReviewsCount(REVIEWS_PER_PAGE);
        }
    }, [isOpen, activeTab, course.id, myReviewId]);

    const fetchReviews = async () => {
        setIsReviewLoading(true);
        try {
            const response = await axios.get<APIResponse<{ reviews: Review[], totalReviews: number }>>(`${API_BASE_URL}/reviews/${course.id}`);

            const fetchedReviews = response.data.data.reviews || [];
            setTotalReviews(response.data.data.totalReviews || 0);

            const validReviews = fetchedReviews.filter(r => r.student && r.student.name);
            setReviews(validReviews);

            if (currentStudentId) {
                const myReview = validReviews.find(r => r.student._id === currentStudentId);
                if (myReview) {
                    setHasMyReview(true);
                    setMyReviewId(myReview._id);
                    setMyRating(myReview.rating);
                    setMyComment(myReview.comment);
                } else {
                    setHasMyReview(false);
                    setMyReviewId(null);
                    setMyRating(0);
                    setMyComment('');
                }
            } else {
                setHasMyReview(false);
                setMyReviewId(null);
                setMyRating(0);
                setMyComment('');
            }
        } catch (error: any) {
            console.error("Failed to fetch reviews:", error);
            toast.error(error.response?.data?.message || 'Failed to fetch reviews.');
            setReviews([]);
            setTotalReviews(0);
        } finally {
            setIsReviewLoading(false);
        }
    };

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
        setCompletedLectureIds(prev => {
            if (!prev.includes(lectureId)) {
                const newCompleted = [...prev, lectureId];
                localStorage.setItem(`course-progress-${course.id}`, JSON.stringify(newCompleted));
                return newCompleted;
            }
            return prev;
        });
    };

    const handleReviewSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (myRating === 0 || !myComment) {
            toast.error("Please provide a rating and a comment.");
            return;
        }
        if (!currentStudentId) {
            toast.error("You must be logged in to submit a review.");
            return;
        }

        try {
            if (editingReviewId) {
                const response = await axios.put<APIResponse<Review>>(`${API_BASE_URL}/reviews/${editingReviewId}`, {
                    rating: myRating,
                    comment: myComment
                });
                const updatedReview = response.data.data;
                setReviews(reviews.map(r => r._id === updatedReview._id ? updatedReview : r));
                setEditingReviewId(null);
                toast.success("Review updated successfully!");
            } else {
                const postResponse = await axios.post<APIResponse<any>>(`${API_BASE_URL}/reviews`, {
                    courseId: course.id,
                    rating: myRating,
                    comment: myComment
                });

                const newReviewData = postResponse.data.data;

                const newReviewForUI: Review = {
                    ...newReviewData,
                    student: {
                        _id: currentStudentId,
                        name: 'You'
                    }
                };

                setReviews([newReviewForUI, ...reviews]);
                setHasMyReview(true);
                setMyReviewId(newReviewForUI._id);
                setTotalReviews(prev => prev + 1);
                toast.success("Review submitted successfully!");
            }
            setMyRating(0);
            setMyComment('');
        } catch (error: any) {
            console.error("Failed to submit review:", error);
            const errorMessage = error.response?.data?.message || "Failed to submit review.";
            toast.error(errorMessage);
            if (error.response?.status === 409) {
                setHasMyReview(true);
                fetchReviews();
            }
        }
    };

    const handleEditClick = (review: Review) => {
        setEditingReviewId(review._id);
        setMyRating(review.rating);
        setMyComment(review.comment);
    };

    // NEW: Open the confirmation dialog
    const handleDeleteClick = (reviewId: string) => {
        setReviewToDeleteId(reviewId);
        setIsConfirmDialogOpen(true);
    };

    // NEW: Handle the actual deletion after confirmation
    const confirmDelete = async () => {
        if (!reviewToDeleteId) return;

        try {
            await axios.delete(`${API_BASE_URL}/reviews/${reviewToDeleteId}`);
            setReviews(reviews.filter(r => r._id !== reviewToDeleteId));
            setHasMyReview(false);
            setMyReviewId(null);
            setTotalReviews(prev => prev - 1);
            setMyRating(0);
            setMyComment('');
            toast.success("Review deleted successfully!");
        } catch (error: any) {
            console.error("Failed to delete review:", error);
            toast.error(error.response?.data?.message || "Failed to delete review.");
        } finally {
            setIsConfirmDialogOpen(false);
            setReviewToDeleteId(null);
        }
    };

    const completedLecturesCount = completedLectureIds.length;
    const totalLectures = course.lectures.length;
    const courseProgress = totalLectures > 0 ? (completedLecturesCount / totalLectures) * 100 : 0;

    const handleShowMoreReviews = () => {
        setVisibleReviewsCount(prevCount => prevCount + REVIEWS_PER_PAGE);
    };

    const handleShowLessReviews = () => {
        setVisibleReviewsCount(REVIEWS_PER_PAGE);
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 z-50 overflow-y-auto">
                <div className="flex items-center justify-center min-h-screen px-4 backdrop-blur-sm pt-4 pb-20 text-center sm:block sm:p-0">
                    <div
                        className="inset-0 transition-opacity bg-opacity-75"
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
                                                    {completedLecturesCount} of {totalLectures} lectures completed
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
                                        <div className="absolute inset-0 bg-opacity-40 flex items-center justify-center rounded-xl">
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
                                                onClick={() => onEnroll(course.id)}
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
                                            { id: 'reviews', label: `Reviews (${totalReviews})` }
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
                                            {course.lectures.map((lecture, index) => {
                                                const isCompleted = completedLectureIds.includes(lecture.id);
                                                const isCurrent = currentLecture?.id === lecture.id;
                                                return (
                                                    <div
                                                        key={lecture.id}
                                                        onClick={() => handleLectureClick(lecture)}
                                                        className={`p-3 rounded-lg border transition-all duration-200 ${isCurrent
                                                            ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                                                            : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
                                                            } ${course.isEnrolled && !lecture.isLocked ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'
                                                            }`}
                                                    >
                                                        <div className="flex items-center space-x-3">
                                                            <div className="flex-shrink-0">
                                                                {isCompleted ? (
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
                                                        {lectureProgress[lecture.id] > 0 && !isCompleted && (
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
                                                );
                                            })}
                                        </div>
                                    )}

                                    {activeTab === 'reviews' && (
                                        <div className="space-y-6">
                                            {isReviewLoading ? (
                                                <div className="flex items-center justify-center py-8 text-gray-500 dark:text-gray-400">
                                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-3"></div>
                                                    Loading reviews...
                                                </div>
                                            ) : (
                                                <>
                                                    {course.isEnrolled && !hasMyReview && (
                                                        <form onSubmit={handleReviewSubmit} className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl shadow-inner border border-gray-200 dark:border-gray-700">
                                                            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                                                                Write a Review
                                                            </h4>
                                                            <div className="mb-4">
                                                                <label htmlFor="rating" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Your rating</label>
                                                                <div className="flex items-center space-x-1">
                                                                    {[1, 2, 3, 4, 5].map(star => (
                                                                        <Star
                                                                            key={star}
                                                                            onClick={() => setMyRating(star)}
                                                                            className={`w-8 h-8 cursor-pointer transition-transform duration-200 hover:scale-110 ${myRating >= star ? 'text-yellow-400 fill-current' : 'text-gray-300 dark:text-gray-600'}`}
                                                                        />
                                                                    ))}
                                                                </div>
                                                            </div>
                                                            <div className="mb-4">
                                                                <label htmlFor="comment" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Your review</label>
                                                                <textarea
                                                                    id="comment"
                                                                    value={myComment}
                                                                    onChange={(e) => setMyComment(e.target.value)}
                                                                    placeholder="Share your thoughts on this course..."
                                                                    className="w-full p-3 text-sm border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                                                                    rows={4}
                                                                />
                                                            </div>
                                                            <button
                                                                type="submit"
                                                                className="w-full px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200"
                                                            >
                                                                Submit Review
                                                            </button>
                                                        </form>
                                                    )}
                                                    {course.isEnrolled && hasMyReview && (
                                                        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
                                                            <h4 className="text-xl font-bold text-blue-900 dark:text-blue-300 mb-2">
                                                                Your Review
                                                            </h4>
                                                            <p className="text-sm text-blue-800 dark:text-blue-400 mb-4">
                                                                You have already submitted a review for this course. You can edit or delete it below.
                                                            </p>
                                                            {editingReviewId ? (
                                                                <form onSubmit={handleReviewSubmit} className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-inner">
                                                                    <div className="mb-4">
                                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Edit your rating</label>
                                                                        <div className="flex items-center space-x-1">
                                                                            {[1, 2, 3, 4, 5].map(star => (
                                                                                <Star
                                                                                    key={star}
                                                                                    onClick={() => setMyRating(star)}
                                                                                    className={`w-8 h-8 cursor-pointer transition-transform duration-200 hover:scale-110 ${myRating >= star ? 'text-yellow-400 fill-current' : 'text-gray-300 dark:text-gray-600'}`}
                                                                                />
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                    <div className="mb-4">
                                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Edit your review</label>
                                                                        <textarea
                                                                            value={myComment}
                                                                            onChange={(e) => setMyComment(e.target.value)}
                                                                            className="w-full p-3 text-sm border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                                                                            rows={4}
                                                                        />
                                                                    </div>
                                                                    <div className="flex space-x-2">
                                                                        <button
                                                                            type="submit"
                                                                            className="flex-1 px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200"
                                                                        >
                                                                            Save Changes
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => setEditingReviewId(null)}
                                                                            className="flex-1 px-4 py-3 bg-gray-300 text-gray-800 font-semibold rounded-lg hover:bg-gray-400 transition-colors duration-200"
                                                                        >
                                                                            Cancel
                                                                        </button>
                                                                    </div>
                                                                </form>
                                                            ) : (
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex items-center space-x-2">
                                                                        <div className="flex">
                                                                            {[1, 2, 3, 4, 5].map(star => (
                                                                                <Star key={star} className={`w-4 h-4 ${myRating >= star ? 'text-yellow-400 fill-current' : 'text-gray-300 dark:text-gray-600'}`} />
                                                                            ))}
                                                                        </div>
                                                                        <p className="text-sm font-medium text-gray-900 dark:text-white">{myComment}</p>
                                                                    </div>
                                                                    <div className="flex space-x-2">
                                                                        <button onClick={() => {
                                                                            const myReview = reviews.find(r => r._id === myReviewId);
                                                                            if (myReview) handleEditClick(myReview);
                                                                        }} className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-full transition-colors">
                                                                            <Edit className="w-5 h-5" />
                                                                        </button>
                                                                        {/* FIX: Call handleDeleteClick with the review ID */}
                                                                        <button onClick={() => {
                                                                            if (myReviewId) handleDeleteClick(myReviewId);
                                                                        }} className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-full transition-colors">
                                                                            <Trash2 className="w-5 h-5" />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}

                                                    <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                                                        All Reviews ({totalReviews})
                                                    </h4>
                                                    {reviews.length > 0 ? (
                                                        <div className="space-y-4">
                                                            {reviews.slice(0, visibleReviewsCount).map(review => (
                                                                <div key={review._id} className="bg-white dark:bg-gray-800 p-4 rounded-xl border dark:border-gray-700 shadow-sm">
                                                                    <div className="flex items-center justify-between mb-2">
                                                                        <div className="flex items-center space-x-2">
                                                                            {review.student && review.student.name ? (
                                                                                <>
                                                                                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-sm font-medium">
                                                                                        {review.student.name.charAt(0)}
                                                                                    </div>
                                                                                    <div className="font-semibold text-gray-900 dark:text-white">{review.student.name}</div>
                                                                                </>
                                                                            ) : (
                                                                                <div className="font-semibold text-gray-600 dark:text-gray-400">Anonymous</div>
                                                                            )}
                                                                        </div>
                                                                        <div className="flex items-center">
                                                                            {[1, 2, 3, 4, 5].map(star => (
                                                                                <Star key={star} className={`w-4 h-4 ${review.rating >= star ? 'text-yellow-400 fill-current' : 'text-gray-300 dark:text-gray-600'}`} />
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                    <p className="text-sm text-gray-600 dark:text-gray-400">{review.comment}</p>
                                                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                                                                        {moment(review.createdAt).fromNow()}
                                                                    </p>
                                                                    {currentStudentId && review.student && review.student._id === currentStudentId && !editingReviewId && (
                                                                        <div className="flex space-x-2 mt-2">
                                                                            <button onClick={() => handleEditClick(review)} className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-full transition-colors">
                                                                                <Edit className="w-5 h-5" />
                                                                            </button>
                                                                            {/* FIX: Call handleDeleteClick with the review ID */}
                                                                            <button onClick={() => handleDeleteClick(review._id)} className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-full transition-colors">
                                                                                <Trash2 className="w-5 h-5" />
                                                                            </button>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ))}
                                                            {totalReviews > REVIEWS_PER_PAGE && visibleReviewsCount < totalReviews && (
                                                                <button
                                                                    onClick={handleShowMoreReviews}
                                                                    className="w-full flex items-center justify-center space-x-2 text-blue-600 dark:text-blue-400 font-medium hover:underline py-2"
                                                                >
                                                                    <span>Show More Reviews</span>
                                                                    <ChevronDown className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                            {visibleReviewsCount > REVIEWS_PER_PAGE && (
                                                                <button
                                                                    onClick={handleShowLessReviews}
                                                                    className="w-full flex items-center justify-center space-x-2 text-gray-600 dark:text-gray-400 font-medium hover:underline py-2"
                                                                >
                                                                    <span>Show Less</span>
                                                                    <ChevronUp className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                                            <Star className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                                            <p>No reviews yet. Be the first to review!</p>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* NEW: Render the ConfirmationDialog */}
            <ConfirmationDialog
                isOpen={isConfirmDialogOpen}
                title="Confirm Deletion"
                message="Are you sure you want to delete this review? This action cannot be undone."
                onConfirm={confirmDelete}
                onClose={() => setIsConfirmDialogOpen(false)}
            />
        </>
    );
};

export default CourseDetailModal;