// src/components/AdminDashboardView.tsx

import React from 'react';
import { BookOpen, Users, DollarSign, TrendingUp } from 'lucide-react';

const AdminDashboardView: React.FC = () => {
    const adminStats = [
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

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
            <div className="grid md:grid-cols-4 gap-6">
                {adminStats.map((stat, index) => (
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
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${course.status === 'active'
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                                }`}>
                                {course.status}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboardView;