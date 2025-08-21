import React from 'react';
import { BookOpen, Clock, Award } from 'lucide-react';

const studentStats = [
    { title: 'Enrolled Courses', value: '12', change: '+3', icon: BookOpen, color: 'blue' },
    { title: 'Completed', value: '8', change: '+2', icon: Award, color: 'green' },
    { title: 'In Progress', value: '4', change: '+1', icon: Clock, color: 'orange' },
    { title: 'Certificates', value: '5', change: '+2', icon: Award, color: 'purple' },
];

const myProgress = [
    { course: 'React Development', progress: 75, nextLesson: 'Redux Fundamentals' },
    { course: 'Python Basics', progress: 45, nextLesson: 'Object-Oriented Programming' },
    { course: 'UI/UX Design', progress: 90, nextLesson: 'Final Project' },
];

const StudentDashboardHome: React.FC = () => {
    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome back, Student!</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Continue your learning journey</p>
            </div>
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
};

export default StudentDashboardHome;