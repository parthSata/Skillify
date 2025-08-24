import React, { useState, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
import { CourseCard, CourseDetailModal } from '@/components/index';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const API_BASE_URL = 'http://localhost:3000/api/v1';

// Interface for data received directly from the API
interface API_Course {
  _id: string;
  title: string;
  description: string;
  thumbnail: string;
  tutor: { _id: string; name: string };
  price: number;
  rating: number;
  students: number;
  category: { name: string; _id: string };
  duration: string;
  lectures: any[];
}

// Interface for the data used by the CourseCard and Modal components
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
  isEnrolled?: boolean;
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
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [razorpayLoaded, setRazorpayLoaded] = useState(false); // New state to track script loading

  // NEW: State to hold the current student's ID
  const [currentStudentId, setCurrentStudentId] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  // Load Razorpay script only once
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
      setRazorpayLoaded(true);
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        // FIX: Change the route to match the backend
        const studentResponse = await axios.get<APIResponse<any>>(`${API_BASE_URL}/users/me`);
        setCurrentStudentId(studentResponse.data.data._id);

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

  const openCourseModal = async (_id: string) => {
    try {
      const courseResponse = await axios.get<APIResponse<Course>>(`${API_BASE_URL}/courses/${_id}`);
      // Send studentId with the request to get enrollment status
      const enrollmentResponse = await axios.get<APIResponse<{ isEnrolled: boolean }>>(`${API_BASE_URL}/student/enrollment-status/${_id}?studentId=${currentStudentId}`);

      if (courseResponse.data.success && enrollmentResponse.data.success) {
        const formattedCourse = {
          ...courseResponse.data.data,
          isEnrolled: enrollmentResponse.data.data.isEnrolled,
          tutor: courseResponse.data.data.tutor,
          lectures: (courseResponse.data.data.lectures as any[]).map(l => ({ ...l, id: l._id }))
        };

        setSelectedCourse(formattedCourse);
        setIsModalOpen(true);
      } else {
        toast.error("Failed to load course details for modal.");
      }
    } catch (err) {
      toast.error("An error occurred while fetching course details.");
      console.error(err);
    }
  };

  const closeCourseModal = () => {
    setIsModalOpen(false);
    setSelectedCourse(null);
  };

  const handleEnrollment = async (courseId: string) => {
    // Prevent enrollment if Razorpay script hasn't loaded
    if (!razorpayLoaded) {
      toast.error("Payment script not loaded yet. Please try again.");
      return;
    }

    try {
      const orderResponse = await axios.post<APIResponse<any>>(`${API_BASE_URL}/payments/razorpay/order/${courseId}`);
      const order = orderResponse.data.data;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "Skillify Course Enrollment",
        description: selectedCourse?.title,
        order_id: order.id,
        handler: async (response: any) => {
          try {
            const verifyResponse = await axios.post<APIResponse<any>>(`${API_BASE_URL}/payments/razorpay/verify`, {
              razorpay_order_id: order.id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              courseId: courseId,
            });

            if (verifyResponse.data.success) {
              toast.success("Enrollment successful!");
              const updatedCourseResponse = await axios.get<APIResponse<Course>>(`${API_BASE_URL}/courses/${courseId}`);
              if (updatedCourseResponse.data.success) {
                setSelectedCourse({ ...updatedCourseResponse.data.data, isEnrolled: true });
              }
            } else {
              toast.error(verifyResponse.data.message || "Payment verification failed.");
            }
          } catch (err) {
            toast.error("An error occurred during payment verification.");
          }
        },
        prefill: {
          name: "Student Name",
          email: "student@example.com",
        },
        theme: {
          color: "#3B82F6",
        },
      };
      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to initiate payment.");
    }
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
              onCourseClick={() => openCourseModal(course._id)}
            />
          ))
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400">No courses found.</p>
        )}
      </div>

      {selectedCourse && (
        <CourseDetailModal
          isOpen={isModalOpen}
          onClose={closeCourseModal}
          course={{
            id: selectedCourse._id,
            title: selectedCourse.title,
            description: selectedCourse.description,
            thumbnail: selectedCourse.thumbnail,
            tutor: selectedCourse.tutor.name,
            price: selectedCourse.price,
            rating: selectedCourse.rating,
            students: selectedCourse.students,
            duration: selectedCourse.duration,
            category: selectedCourse.category,
            lectures: selectedCourse.lectures.map(l => ({ ...l, id: l._id })),
            isEnrolled: selectedCourse.isEnrolled,
          }}
          onEnroll={handleEnrollment}
          // NEW: Pass the dynamic student ID
          currentStudentId={currentStudentId}
        />
      )}
    </div>
  );
};

export default StudentBrowseCourses;