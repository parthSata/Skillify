import React from 'react';
import { BookOpen, Users, DollarSign, TrendingUp, Edit, Trash2, Tag } from 'lucide-react';
import { Modal } from '@/components/Modal';
import { CourseForm } from '@/components/CourseForm';
import { CategoryForm } from '@/components/CategoryForm';
import { useNavigate } from 'react-router-dom';

interface TutorDashboardProps {
  currentView: string;
}

const TutorDashboard: React.FC<TutorDashboardProps> = ({ currentView }) => {
  const [showCourseModal, setShowCourseModal] = React.useState(false);
  const [showCategoryModal, setShowCategoryModal] = React.useState(false);
  const [editingCourse, setEditingCourse] = React.useState<any>(null);
  const [editingCategory, setEditingCategory] = React.useState<any>(null);
  const navigate = useNavigate();

  const tutorStats = [
    { title: 'My Courses', value: '8', change: '+2', icon: BookOpen, color: 'blue' },
    { title: 'Total Students', value: '1,245', change: '+45', icon: Users, color: 'green' },
    { title: 'Monthly Revenue', value: '$3,250', change: '+15%', icon: DollarSign, color: 'purple' },
    { title: 'Course Rating', value: '4.8', change: '+0.2', icon: TrendingUp, color: 'orange' },
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

  const categories = [
    { id: '1', name: 'Web Development', description: 'Frontend and backend development', color: '#3B82F6', icon: 'Code', courses: 8 },
    { id: '2', name: 'Programming', description: 'General programming concepts', color: '#10B981', icon: 'Terminal', courses: 5 },
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
    navigate(`/tutor/${view}`);
  };

  if (currentView === 'dashboard') {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Tutor Dashboard</h1>
          <div className="space-x-2">
            <button onClick={() => handleViewChange('courses')} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded">
              My Courses
            </button>
            <button onClick={() => handleViewChange('create-course')} className="px-4 py-2 bg-blue-600 text-white rounded">
              Create Course
            </button>
            <button onClick={() => handleViewChange('categories')} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded">
              Categories
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
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">My Recent Courses</h3>
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Courses</h1>
          <div className="space-x-2">
            <button onClick={() => handleViewChange('dashboard')} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded">
              Dashboard
            </button>
            <button onClick={() => handleViewChange('create-course')} className="px-4 py-2 bg-blue-600 text-white rounded">
              Create Course
            </button>
            <button onClick={() => handleViewChange('categories')} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded">
              Categories
            </button>
            <button onClick={() => handleViewChange('analytics')} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded">
              Analytics
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myCourses.map((course) => (
            <div key={course.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300">
              <img src={course.thumbnail} alt={course.title} className="w-full h-48 object-cover" />
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{course.title}</h3>
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
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  <p>{course.students} students</p>
                  <p>{course.revenue} revenue</p>
                  <p>⭐ {course.rating} rating</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg font-medium transition-colors flex items-center justify-center space-x-1"
                    onClick={() => handleEditCourse(course)}
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                  <button className="px-3 py-2 border border-red-300 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
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
              My Courses
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

  if (currentView === 'categories') {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Categories</h1>
          <div className="space-x-2">
            <button onClick={() => handleViewChange('dashboard')} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded">
              Dashboard
            </button>
            <button onClick={() => handleViewChange('courses')} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded">
              My Courses
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

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white capitalize">{currentView.replace('-', ' ')}</h1>
        <div className="space-x-2">
          <button onClick={() => handleViewChange('dashboard')} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded">
            Dashboard
          </button>
          <button onClick={() => handleViewChange('courses')} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded">
            My Courses
          </button>
          <button onClick={() => handleViewChange('create-course')} className="px-4 py-2 bg-blue-600 text-white rounded">
            Create Course
          </button>
          <button onClick={() => handleViewChange('categories')} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded">
            Categories
          </button>
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <p className="text-gray-600 dark:text-gray-400">
          {currentView === 'analytics' && 'Track your course performance, student engagement, and revenue analytics.'}
        </p>
      </div>
    </div>
  );
};

export default TutorDashboard;