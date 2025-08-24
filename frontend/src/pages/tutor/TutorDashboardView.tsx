// frontend/src/pages/tutor/TutorDashboardView.tsx

import React, { useState, useEffect } from 'react';
import { BookOpen, Users, DollarSign, TrendingUp, Star } from 'lucide-react';
import { TutorStats, TutorCoursesTable } from '@/components/index';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns/formatDistanceToNow';

const API_BASE_URL = 'http://localhost:3000/api/v1';

// Define the API response structure
interface APIResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Define the Course interface from the API
interface API_Course {
  _id: string;
  title: string;
  isApproved: boolean;
  thumbnail: string;
}

// Define the interface for the component's state and props
interface ComponentCourse {
  _id: string;
  title: string;
  students: number;
  revenue: string;
  rating: number;
  status: string;
  thumbnail: string;
}

// Define the interfaces for reviews
interface Review {
  _id: string;
  course: { _id: string; title: string };
  student: { _id: string; name: string; avatar: string };
  rating: number;
  comment?: string;
  createdAt: string;
}

// Define interface for dashboard stats
interface DashboardStats {
  totalCourses: number;
  totalStudents: number;
  averageRating: number;
  monthlyRevenue: number;
}

const TutorDashboardView: React.FC = () => {
  const [myCourses, setMyCourses] = useState<ComponentCourse[]>([]);
  const [myReviews, setMyReviews] = useState<Review[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [reviewsSkip, setReviewsSkip] = useState(0);
  const [hasMoreReviews, setHasMoreReviews] = useState(true);
  const REVIEWS_LIMIT = 10;

  // Function to fetch courses
  const fetchMyCourses = async () => {
    try {
      const response = await axios.get<APIResponse<API_Course[]>>(
        `${API_BASE_URL}/tutor/courses`
      );
      if (response.data.success) {
        const formattedCourses: ComponentCourse[] = response.data.data.map((course) => ({
          _id: course._id,
          title: course.title,
          students: 0,
          revenue: '0',
          rating: 0,
          status: course.isApproved ? 'active' : 'pending',
          thumbnail: course.thumbnail,
        }));
        setMyCourses(formattedCourses);
      }
    } catch (error) {
      console.error('Failed to fetch courses for dashboard:', error);
      toast.error('Failed to fetch dashboard courses.');
    } finally {
      setLoadingCourses(false);
    }
  };

  // Function to fetch reviews
  const fetchMyReviews = async (skip: number) => {
    try {
      setLoadingReviews(true);
      const response = await axios.get<APIResponse<{ reviews: Review[]; totalReviews: number }>>(
        `${API_BASE_URL}/reviews/tutor/reviews?limit=${REVIEWS_LIMIT}&skip=${skip}`
      );
      if (response.data.success) {
        const { reviews, totalReviews } = response.data.data;
        if (skip === 0) {
          setMyReviews(reviews);
        } else {
          setMyReviews((prevReviews) => [...prevReviews, ...reviews]);
        }
        setHasMoreReviews(myReviews.length + reviews.length < totalReviews);
      }
    } catch (error) {
      console.error('Failed to fetch tutor reviews:', error);
      toast.error('Failed to fetch reviews.');
    } finally {
      setLoadingReviews(false);
    }
  };

  // Function to fetch dashboard stats
  const fetchDashboardStats = async () => {
    try {
      const response = await axios.get<APIResponse<DashboardStats>>(
        `${API_BASE_URL}/reviews/tutor/stats`
      );
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      toast.error('Failed to fetch dashboard stats.');
    }
  };

  useEffect(() => {
    fetchMyCourses();
    fetchMyReviews(0);
    fetchDashboardStats();
  }, []);

  const handleShowMore = () => {
    const newSkip = reviewsSkip + REVIEWS_LIMIT;
    setReviewsSkip(newSkip);
    fetchMyReviews(newSkip);
  };

  const handleEdit = (course: ComponentCourse) => {
    console.log('Editing course:', course);
  };

  // Dummy functions to satisfy prop requirements
  const handleToggleStatus = (_course: ComponentCourse) => { };
  const handleDelete = (_course: ComponentCourse) => { };

  // Helper function to render star ratings
  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`h-4 w-4 ${i <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
          fill="currentColor"
        />
      );
    }
    return <div className="flex">{stars}</div>;
  };

  // Dynamically create the stats array based on the fetched data
  const dynamicTutorStats = stats ? [
    { title: 'My Courses', value: stats.totalCourses.toString(), change: '+2', icon: BookOpen, color: 'blue' },
    { title: 'Total Students', value: stats.totalStudents.toLocaleString(), change: '+45', icon: Users, color: 'green' },
    { title: 'Monthly Revenue', value: `${stats.monthlyRevenue.toLocaleString()}`, change: '+15%', icon: DollarSign, color: 'purple' },
    { title: 'Course Rating', value: stats.averageRating.toFixed(1), change: '+0.2', icon: TrendingUp, color: 'orange' },
  ] : [
    // Fallback to static data while loading
    { title: 'My Courses', value: '...', change: '...', icon: BookOpen, color: 'blue' },
    { title: 'Total Students', value: '...', change: '...', icon: Users, color: 'green' },
    { title: 'Monthly Revenue', value: '...', change: '...', icon: DollarSign, color: 'purple' },
    { title: 'Course Rating', value: '...', change: '...', icon: TrendingUp, color: 'orange' },
  ];

  return (
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Tutor Dashboard</h1>
      <TutorStats stats={dynamicTutorStats} />

      {/* My Recent Courses Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">My Recent Courses</h3>
        {loadingCourses ? (
          <div className="text-center text-gray-500 dark:text-gray-400">Loading courses...</div>
        ) : myCourses.length > 0 ? (
          <TutorCoursesTable
            courses={myCourses.slice(0, 3)}
            onEdit={handleEdit}
            isDashboardView={true}
            onToggleStatus={handleToggleStatus}
            onDelete={handleDelete}
          />
        ) : (
          <div className="text-center text-gray-500 dark:text-gray-400">No courses available.</div>
        )}
      </div>

      {/* New section for Recent Feedback (Card-based UI) */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Student Feedback</h3>
        {loadingReviews && myReviews.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400">Loading feedback...</div>
        ) : myReviews.length > 0 ? (
          <div className="space-y-3">
            {myReviews.map((review) => (
              <div key={review._id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-4 rounded-lg shadow-sm">
                <div className="flex items-center space-x-3 mb-2">
                  <img
                    className="h-10 w-10 rounded-full object-cover border-2 border-blue-500 dark:border-blue-400"
                    src={review.student.avatar}
                    alt={review.student.name}
                    onError={(e) => {
                      const initial = review.student.name ? review.student.name.charAt(0).toUpperCase() : 'U';
                      e.currentTarget.src = `https://placehold.co/40x40/60a5fa/ffffff?text=${initial}`;
                    }}
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 dark:text-white text-sm">{review.student.name}</div>
                    <div className="text-xs font-medium text-gray-600 dark:text-gray-400">{review.course.title}</div>
                  </div>
                </div>

                <div className="flex items-center mb-2">
                  <div className="flex items-center mr-1">
                    {renderStars(review.rating)}
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">({review.rating} / 5)</span>
                </div>

                <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed mb-2">
                  {review.comment || 'No comment provided.'}
                </p>

                <div className="text-right text-xs text-gray-400 dark:text-gray-500">
                  {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                </div>
              </div>
            ))}
            {hasMoreReviews && (
              <div className="text-center mt-4">
                <button
                  onClick={handleShowMore}
                  className="px-6 py-2 text-sm font-medium text-blue-600 bg-blue-100 rounded-full hover:bg-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loadingReviews}
                >
                  {loadingReviews ? 'Loading...' : 'Show More Reviews'}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center text-gray-500 dark:text-gray-400">No feedback available for your courses yet.</div>
        )}
      </div>
    </div>
  );
};

export default TutorDashboardView;