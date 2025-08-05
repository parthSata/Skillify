import React, { useState } from 'react';
import { BookOpen, Users, DollarSign, TrendingUp, Edit, Trash2, Tag } from 'lucide-react';
import { Modal } from '@/components/Modal';
import { CourseForm } from '@/components/CourseForm';
import { CategoryForm } from '@/components/CategoryForm';
import { useNavigate } from 'react-router-dom';

interface AdminDashboardProps {
  currentView: string;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ currentView }) => {
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any>(null);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const navigate = useNavigate();

  const tutorStats = [
    { title: 'Total Courses', value: '8', change: '+2', icon: BookOpen, color: 'blue' },
    { title: 'Total Students', value: '1,245', change: '+45', icon: Users, color: 'green' },
    { title: 'Monthly Revenue', value: '$3,250', change: '+15%', icon: DollarSign, color: 'purple' },
    { title: 'Average Rating', value: '4.8', change: '+0.2', icon: TrendingUp, color: 'orange' },
  ];

  const myCourses = [
    {
      id: 1,
      title: 'React Advanced Concepts',
      students: 234,
      revenue: '$1,200',
      rating: 4.9,
      status: 'active',
      thumbnail: 'https://images.pexels.com/photos/11035471/pexels-photo-11035471.jpeg?auto=compress&cs=tinysrgb&w=300',
    },
    {
      id: 2,
      title: 'JavaScript Fundamentals',
      students: 456,
      revenue: '$890',
      rating: 4.7,
      status: 'active',
      thumbnail: 'https://images.pexels.com/photos/4164418/pexels-photo-4164418.jpeg?auto=compress&cs=tinysrgb&w=300',
    },
    {
      id: 3,
      title: 'Node.js Backend Development',
      students: 189,
      revenue: '$650',
      rating: 4.8,
      status: 'pending',
      thumbnail: 'https://images.pexels.com/photos/1181673/pexels-photo-1181673.jpeg?auto=compress&cs=tinysrgb&w=300',
    },
  ];

  const courses = [
    {
      id: '1',
      title: 'Complete React Development',
      tutor: 'John Smith',
      category: 'Web Development',
      students: 234,
      revenue: '$1,200',
      status: 'active',
      thumbnail: 'https://images.pexels.com/photos/11035471/pexels-photo-11035471.jpeg?auto=compress&cs=tinysrgb&w=300',
      lectures: [
        { id: '1', title: 'Introduction to React', duration: '15 min', videoUrl: '', description: 'Basic React concepts' },
      ],
    },
    {
      id: '2',
      title: 'Python for Beginners',
      tutor: 'Sarah Johnson',
      category: 'Programming',
      students: 456,
      revenue: '$890',
      status: 'pending',
      thumbnail: 'https://images.pexels.com/photos/4164418/pexels-photo-4164418.jpeg?auto=compress&cs=tinysrgb&w=300',
      lectures: [],
    },
  ];

  const categories = [
    { id: '1', name: 'Web Development', description: 'Frontend and backend development', color: '#3B82F6', icon: 'Code', courses: 45 },
    { id: '2', name: 'Data Science', description: 'Analytics and machine learning', color: '#10B981', icon: 'BarChart3', courses: 32 },
    { id: '3', name: 'Design', description: 'UI/UX and graphic design', color: '#8B5CF6', icon: 'Palette', courses: 28 },
  ];

  const handleCourseSubmit = (courseData: any) => {
    console.log('Course submitted:', courseData);
    setShowCourseModal(false);
    setEditingCourse(null);
  };

  const handleCategorySubmit = (categoryData: any) => {
    console.log('Category submitted:', categoryData);
    setShowCategoryModal(false);
    setEditingCategory(null);
  };

  const handleEditCourse = (course: any) => {
    setEditingCourse(course);
    setShowCourseModal(true);
  };

  const handleEditCategory = (category: any) => {
    setEditingCategory(category);
    setShowCategoryModal(true);
  };

  const handleViewChange = (view: string) => {
    navigate(`/admin/${view}`);
  };

  if (currentView === 'dashboard') {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
          <div className="space-x-2">
            <button onClick={() => handleViewChange('courses')} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded">
              Courses
            </button>
            <button onClick={() => handleViewChange('categories')} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded">
              Categories
            </button>
            <button onClick={() => handleViewChange('create-course')} className="px-4 py-2 bg-blue-600 text-white rounded">
              Create Course
            </button>
            <button onClick={() => handleViewChange('analytics')} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded">
              Analytics
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          {tutorStats.map((stat, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</p>
                  <p className="text-sm text-green-600 mt-1">{stat.change} this month</p>
                </div>
                <div className={`p-3 rounded-full bg-${stat.color}-100 dark:bg-${stat.color}-900/20`}>
                  <stat.icon className={`w-6 h-6 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Courses</h3>
          <div className="space-y-4">
            {myCourses.slice(0, 3).map((course) => (
              <div key={course.id} className="flex items-center space-x-4 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <img src={course.thumbnail} alt={course.title} className="w-16 h-16 object-cover rounded-lg" />
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 dark:text-white">{course.title}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {course.students} students • {course.revenue} revenue • ⭐ {course.rating}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    course.status === 'active'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                  }`}
                >
                  {course.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'courses') {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Course Management</h1>
          <div className="space-x-2">
            <button onClick={() => handleViewChange('dashboard')} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded">
              Dashboard
            </button>
            <button onClick={() => handleViewChange('categories')} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded">
              Categories
            </button>
            <button onClick={() => handleViewChange('create-course')} className="px-4 py-2 bg-blue-600 text-white rounded">
              Add Course
            </button>
            <button onClick={() => handleViewChange('analytics')} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded">
              Analytics
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Course</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tutor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Students</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {courses.map((course) => (
                  <tr key={course.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img src={course.thumbnail} alt={course.title} className="w-12 h-12 object-cover rounded-lg mr-4" />
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{course.title}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{course.revenue}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{course.tutor}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{course.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{course.students}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          course.status === 'active'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                        }`}
                      >
                        {course.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditCourse(course)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <Modal
          isOpen={showCourseModal}
          onClose={() => {
            setShowCourseModal(false);
            setEditingCourse(null);
          }}
          title={editingCourse ? 'Edit Course' : 'Create New Course'}
          size="xl"
        >
          <CourseForm
            course={editingCourse}
            onSubmit={handleCourseSubmit}
            onCancel={() => {
              setShowCourseModal(false);
              setEditingCourse(null);
            }}
            isEditing={!!editingCourse}
          />
        </Modal>
      </div>
    );
  }

  if (currentView === 'categories') {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Category Management</h1>
          <div className="space-x-2">
            <button onClick={() => handleViewChange('dashboard')} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded">
              Dashboard
            </button>
            <button onClick={() => handleViewChange('courses')} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded">
              Courses
            </button>
            <button onClick={() => handleViewChange('create-course')} className="px-4 py-2 bg-blue-600 text-white rounded">
              Create Course
            </button>
            <button onClick={() => handleViewChange('analytics')} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded">
              Analytics
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <div key={category.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg" style={{ backgroundColor: `${category.color}20` }}>
                  <Tag className="w-6 h-6" style={{ color: category.color }} />
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEditCategory(category)}
                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{category.name}</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{category.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">{category.courses} courses</span>
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: category.color }}></div>
              </div>
            </div>
          ))}
        </div>

        <Modal
          isOpen={showCategoryModal}
          onClose={() => {
            setShowCategoryModal(false);
            setEditingCategory(null);
          }}
          title={editingCategory ? 'Edit Category' : 'Create New Category'}
          size="lg"
        >
          <CategoryForm
            category={editingCategory}
            onSubmit={handleCategorySubmit}
            onCancel={() => {
              setShowCategoryModal(false);
              setEditingCategory(null);
            }}
            isEditing={!!editingCategory}
          />
        </Modal>
      </div>
    );
  }

  if (currentView === 'create-course') {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Course</h1>
          <div className="space-x-2">
            <button onClick={() => handleViewChange('dashboard')} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded">
              Dashboard
            </button>
            <button onClick={() => handleViewChange('courses')} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded">
              Courses
            </button>
            <button onClick={() => handleViewChange('categories')} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded">
              Categories
            </button>
            <button onClick={() => handleViewChange('analytics')} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded">
              Analytics
            </button>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <CourseForm
            onSubmit={handleCourseSubmit}
            onCancel={() => handleViewChange('courses')}
            isEditing={false}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white capitalize">{currentView.replace('-', ' ')}</h1>
        <div className="space-x-2">
          <button onClick={() => handleViewChange('dashboard')} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded">
            Dashboard
          </button>
          <button onClick={() => handleViewChange('courses')} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded">
            Courses
          </button>
          <button onClick={() => handleViewChange('categories')} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded">
            Categories
          </button>
          <button onClick={() => handleViewChange('create-course')} className="px-4 py-2 bg-blue-600 text-white rounded">
            Create Course
          </button>
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <p className="text-gray-600 dark:text-gray-400">
          {currentView === 'analytics' && 'Track platform performance, course engagement, and revenue analytics.'}
        </p>
      </div>
    </div>
  );
};

export default AdminDashboard;