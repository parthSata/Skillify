// src/pages/student/StudentBrowseCourses.tsx

import React, { useState, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
import { CourseCard } from '@/components/index';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const API_BASE_URL = 'http://localhost:3000/api/v1';

// Interface for data received directly from the API
interface API_Course {
  _id: string;
  title: string;
  description: string;
  thumbnail: string;
  tutor: { _id: string; name: string }; // Corrected: Tutor now has _id
  price: number;
  rating: number;
  students: number;
  category: { name: string; _id: string };
  duration: string;
  lectures: any[];
}

// Interface for the data used by the CourseCard component
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
  lectures: any[];
}

interface Category {
  _id: string;
  name: string;
}

interface APIResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

const StudentBrowseCourses: React.FC = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        const coursesResponse = await axios.get<APIResponse<API_Course[]>>(`${API_BASE_URL}/courses/all`);
        const categoriesResponse = await axios.get<APIResponse<Category[]>>(`${API_BASE_URL}/categories`);

        if (coursesResponse.data.success && categoriesResponse.data.success) {
          const formattedCourses: Course[] = coursesResponse.data.data.map(apiCourse => ({
            _id: apiCourse._id,
            title: apiCourse.title,
            description: apiCourse.description,
            thumbnail: apiCourse.thumbnail,
            tutor: apiCourse.tutor,
            price: apiCourse.price,
            rating: apiCourse.rating,
            students: apiCourse.students,
            duration: apiCourse.duration,
            category: apiCourse.category.name,
            lectures: apiCourse.lectures || [],
          }));

          setCourses(formattedCourses);
          setCategories(categoriesResponse.data.data);
        } else {
          setError('Failed to fetch data.');
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch data.');
        toast.error(err.response?.data?.message || 'Failed to fetch data.');
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);

  const handleCourseClick = (_id: string) => {
    navigate(`/student/course-details/${_id}`);
  };

  const filteredCourses = courses.filter(course => {
    const matchesCategory = selectedCategory === 'All' || (course.category === selectedCategory);
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return <div className="p-6 text-center text-gray-500 dark:text-gray-400">Loading courses...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-500 dark:text-red-400">Error: {error}</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Browse Courses</h1>
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
        </div>
        <button className="flex items-center space-x-2 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
          <Filter className="w-5 h-5" />
          <span>Filter</span>
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {['All', ...categories.map(cat => cat.name)].map((categoryName) => (
          <button
            key={categoryName}
            onClick={() => setSelectedCategory(categoryName)}
            className={`px-4 py-2 rounded-full font-medium transition-all duration-200 ${selectedCategory === categoryName
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
          >
            {categoryName}
          </button>
        ))}
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.length > 0 ? (
          filteredCourses.map((course) => (
            <CourseCard
              key={course._id}
              course={course}
              onCourseClick={() => handleCourseClick(course._id)}
            />
          ))
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400">No courses found.</p>
        )}
      </div>
    </div>
  );
};

export default StudentBrowseCourses;