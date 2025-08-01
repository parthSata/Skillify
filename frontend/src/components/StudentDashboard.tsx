import React from 'react';
import { BookOpen, Clock, Award, Search, Filter } from 'lucide-react';
import { CourseCard } from './CourseCard';

interface StudentDashboardProps {
  currentView: string;
  onViewChange: (view: string) => void;

}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ currentView }) => {
  const studentStats = [
    { title: 'Enrolled Courses', value: '12', change: '+3', icon: BookOpen, color: 'blue' },
    { title: 'Completed', value: '8', change: '+2', icon: Award, color: 'green' },
    { title: 'In Progress', value: '4', change: '+1', icon: Clock, color: 'orange' },
    { title: 'Certificates', value: '5', change: '+2', icon: Award, color: 'purple' },
  ];

  const featuredCourses = [
    {
      id: '1',
      title: 'Complete React Development Course',
      description: 'Master React from basics to advanced concepts including hooks, context, and state management.',
      thumbnail: 'https://images.pexels.com/photos/11035471/pexels-photo-11035471.jpeg?auto=compress&cs=tinysrgb&w=400',
      tutor: 'John Smith',
      price: 99,
      rating: 4.8,
      students: 2340,
      duration: '12 hours',
      category: 'Web Development'
    },
    {
      id: '2',
      title: 'Python for Data Science',
      description: 'Learn Python programming with focus on data analysis, visualization, and machine learning.',
      thumbnail: 'https://images.pexels.com/photos/4164418/pexels-photo-4164418.jpeg?auto=compress&cs=tinysrgb&w=400',
      tutor: 'Sarah Johnson',
      price: 79,
      rating: 4.9,
      students: 1890,
      duration: '15 hours',
      category: 'Data Science'
    },
    {
      id: '3',
      title: 'UI/UX Design Masterclass',
      description: 'Complete guide to user interface and user experience design principles and tools.',
      thumbnail: 'https://images.pexels.com/photos/1181673/pexels-photo-1181673.jpeg?auto=compress&cs=tinysrgb&w=400',
      tutor: 'Mike Wilson',
      price: 89,
      rating: 4.7,
      students: 1560,
      duration: '10 hours',
      category: 'Design'
    }
  ];

  const myProgress = [
    { course: 'React Development', progress: 75, nextLesson: 'Redux Fundamentals' },
    { course: 'Python Basics', progress: 45, nextLesson: 'Object-Oriented Programming' },
    { course: 'UI/UX Design', progress: 90, nextLesson: 'Final Project' },
  ];

  if (currentView === 'dashboard') {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome back, Student!</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Continue your learning journey</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6">
          {studentStats.map((stat, index) => (
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

        {/* Continue Learning */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Continue Learning</h3>
          <div className="space-y-4">
            {myProgress.map((item, index) => (
              <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">{item.course}</h4>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{item.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${item.progress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Next: {item.nextLesson}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'browse') {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Browse Courses</h1>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search courses..."
              className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
          <button className="flex items-center space-x-2 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <Filter className="w-5 h-5" />
            <span>Filter</span>
          </button>
        </div>

        {/* Course Categories */}
        <div className="flex flex-wrap gap-2">
          {['All', 'Web Development', 'Data Science', 'Design', 'Mobile', 'AI/ML'].map((category) => (
            <button
              key={category}
              className={`px-4 py-2 rounded-full font-medium transition-all duration-200 ${category === 'All'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Course Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onCourseClick={(id) => console.log('Course clicked:', id)}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 capitalize">
        {currentView.replace('-', ' ')}
      </h1>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <p className="text-gray-600 dark:text-gray-400">
          {currentView === 'my-courses' && 'Access all your enrolled courses and track your progress.'}
          {currentView === 'progress' && 'View your learning analytics, achievements, and course completion status.'}
        </p>
      </div>
    </div>
  );
};
export default StudentDashboard;