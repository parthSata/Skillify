import React, { useState, useEffect } from 'react';
import { BookOpen, Users, DollarSign, TrendingUp } from 'lucide-react';
import { TutorStats, TutorCoursesTable } from '@/components/index';
import axios from 'axios';
import { toast } from 'react-hot-toast';

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

const tutorStats = [
  { title: 'My Courses', value: '8', change: '+2', icon: BookOpen, color: 'blue' },
  { title: 'Total Students', value: '1,245', change: '+45', icon: Users, color: 'green' },
  { title: 'Monthly Revenue', value: '$3,250', change: '+15%', icon: DollarSign, color: 'purple' },
  { title: 'Course Rating', value: '4.8', change: '+0.2', icon: TrendingUp, color: 'orange' },
];

const TutorDashboardView: React.FC = () => {
  const [myCourses, setMyCourses] = useState<ComponentCourse[]>([]);
  const [loading, setLoading] = useState(true);

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
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyCourses();
  }, []);

  const handleEdit = (course: ComponentCourse) => {
    console.log('Editing course:', course);
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Tutor Dashboard</h1>
      <TutorStats stats={tutorStats} />
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">My Recent Courses</h3>
        {loading ? (
          <div className="text-center text-gray-500 dark:text-gray-400">Loading courses...</div>
        ) : myCourses.length > 0 ? (
          <TutorCoursesTable courses={myCourses.slice(0, 3)} onEdit={handleEdit} isDashboardView={true} />
        ) : (
          <div className="text-center text-gray-500 dark:text-gray-400">No courses available.</div>
        )}
      </div>
    </div>
  );
};

export default TutorDashboardView;