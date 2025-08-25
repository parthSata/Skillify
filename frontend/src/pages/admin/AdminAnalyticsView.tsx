// src/components/AdminAnalyticsView.tsx

import React, { useState, useEffect } from 'react';
import {
    Users,
    BookOpen,
    DollarSign,
    UserCheck,
    Download,
    RefreshCw,
    Star,
    BarChart3,
    PieChart
} from 'lucide-react';

// Interfaces remain the same
interface AnalyticsData {
    totalRevenue: number;
    totalStudents: number;
    totalTutors: number;
    totalCourses: number;
    monthlyGrowth: {
        revenue: number;
        students: number;
        tutors: number;
        courses: number;
    };
    topCourses: Array<{
        id: string;
        title: string;
        tutor: string;
        students: number;
        revenue: number;
        rating: number;
        thumbnail: string;
    }>;
    topTutors: Array<{
        id: string;
        name: string;
        courses: number;
        students: number;
        revenue: number;
        rating: number;
        avatar: string;
    }>;
    recentTransactions: Array<{
        id: string;
        student: string;
        course: string;
        amount: number;
        date: string;
        status: 'completed' | 'pending' | 'failed';
    }>;
    monthlyRevenue: Array<{
        month: string;
        revenue: number;
        students: number;
    }>;
    categoryStats: Array<{
        name: string;
        courses: number;
        students: number;
        revenue: number;
        color: string;
    }>;
}

const API_BASE_URL = 'http://localhost:3000/api/v1/admin';

const AdminAnalyticsView: React.FC = () => {
    const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedPeriod, setSelectedPeriod] = useState('30d');
    const [activeTab, setActiveTab] = useState('overview');

    const fetchAdminData = async () => {
        setLoading(true);
        setError(null);

        // Fetch options with credentials to send cookies
        const fetchOptions = {
            credentials: 'include' as RequestCredentials,
        };

        try {
            const [
                statsResponse,
                topCoursesResponse,
                topTutorsResponse,
                recentTransactionsResponse,
                monthlyRevenueResponse,
                categoryStatsResponse,
            ] = await Promise.all([
                fetch(`${API_BASE_URL}/analytics`, fetchOptions),
                fetch(`${API_BASE_URL}/top-courses`, fetchOptions),
                fetch(`${API_BASE_URL}/top-tutors`, fetchOptions),
                fetch(`${API_BASE_URL}/recent-transactions`, fetchOptions),
                fetch(`${API_BASE_URL}/monthly-revenue`, fetchOptions),
                fetch(`${API_BASE_URL}/category-stats`, fetchOptions),
            ]);

            // Check if ANY of the responses are NOT ok (e.g., 401 Unauthorized)
            if (!statsResponse.ok || !topCoursesResponse.ok || !topTutorsResponse.ok || !recentTransactionsResponse.ok || !monthlyRevenueResponse.ok || !categoryStatsResponse.ok) {
                // If the status is 401, handle it specifically
                if (statsResponse.status === 401) {
                    setError('Session expired or admin not authenticated. Please log in again.');
                } else {
                    throw new Error('Failed to fetch all analytics data');
                }
                setLoading(false);
                return;
            }

            const stats = await statsResponse.json();
            const topCourses = await topCoursesResponse.json();
            const topTutors = await topTutorsResponse.json();
            const recentTransactions = await recentTransactionsResponse.json();
            const monthlyRevenue = await monthlyRevenueResponse.json();
            const categoryStats = await categoryStatsResponse.json();

            setAnalyticsData({
                totalRevenue: stats.data.totalRevenue,
                totalStudents: stats.data.totalStudents,
                totalTutors: stats.data.totalTutors,
                totalCourses: stats.data.totalCourses,
                monthlyGrowth: {
                    revenue: 12.5, // Placeholder for dynamic calculation
                    students: 8.3,
                    tutors: 15.2,
                    courses: 6.7
                },
                topCourses: topCourses.data.map((course: any) => ({
                    id: course._id,
                    title: course.title,
                    tutor: course.tutor,
                    students: course.students,
                    revenue: course.revenue,
                    rating: course.rating,
                    thumbnail: course.thumbnail
                })),
                topTutors: topTutors.data.map((tutor: any) => ({
                    id: tutor._id,
                    name: tutor.name,
                    courses: tutor.courses,
                    students: tutor.students,
                    revenue: tutor.revenue,
                    rating: tutor.rating,
                    avatar: tutor.avatar
                })),
                recentTransactions: recentTransactions.data.map((transaction: any) => ({
                    id: transaction._id,
                    student: transaction.student,
                    course: transaction.course,
                    amount: transaction.amount,
                    date: new Date(transaction.date).toLocaleDateString(),
                    status: transaction.status,
                })),
                monthlyRevenue: monthlyRevenue.data,
                categoryStats: categoryStats.data,
            });
        } catch (err: any) {
            console.error("Failed to fetch analytics data:", err);
            setError('Failed to load data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Fetch data immediately when the component mounts or `selectedPeriod` changes
        fetchAdminData();
    }, [selectedPeriod]);

    const StatCard = ({ title, value, icon: Icon, color, prefix = '', suffix = '' }: any) => (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{title}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
                    </p>
                </div>
                <div className={`p-3 rounded-full bg-${color}-100 dark:bg-${color}-900/20`}>
                    <Icon className={`w-6 h-6 text-${color}-600 dark:text-${color}-400`} />
                </div>
            </div>
        </div>
    );

    const ChartCard = ({ title, children, className = '' }: any) => (
        <div className={`bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md ${className}`}>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
            {children}
        </div>
    );

    if (loading) {
        return (
            <div className="p-6 space-y-6">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 text-center text-red-500">
                <p>{error}</p>
                <button onClick={() => window.location.href = '/login'} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md">
                    Go to Login
                </button>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
            {analyticsData && (
                <>
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">Monitor platform performance and insights</p>
                        </div>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                            <select
                                value={selectedPeriod}
                                onChange={(e) => setSelectedPeriod(e.target.value)}
                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                            >
                                <option value="7d">Last 7 days</option>
                                <option value="30d">Last 30 days</option>
                                <option value="90d">Last 90 days</option>
                                <option value="1y">Last year</option>
                            </select>
                            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                                <Download className="w-4 h-4" />
                                <span>Export</span>
                            </button>
                            <button onClick={fetchAdminData} className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                <RefreshCw className="w-4 h-4" />
                                <span>Refresh</span>
                            </button>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                        <StatCard
                            title="Total Revenue"
                            value={analyticsData.totalRevenue}
                            icon={DollarSign}
                            color="green"
                            prefix="$"
                        />
                        <StatCard
                            title="Total Students"
                            value={analyticsData.totalStudents}
                            icon={Users}
                            color="blue"
                        />
                        <StatCard
                            title="Active Tutors"
                            value={analyticsData.totalTutors}
                            icon={UserCheck}
                            color="purple"
                        />
                        <StatCard
                            title="Total Courses"
                            value={analyticsData.totalCourses}
                            icon={BookOpen}
                            color="orange"
                        />
                    </div>

                    {/* Tabs */}
                    <div className="border-b border-gray-200 dark:border-gray-700">
                        <nav className="flex space-x-8 overflow-x-auto">
                            {[
                                { id: 'overview', label: 'Overview', icon: BarChart3 },
                                { id: 'courses', label: 'Top Courses', icon: BookOpen },
                                { id: 'tutors', label: 'Top Tutors', icon: Users },
                                { id: 'transactions', label: 'Transactions', icon: DollarSign },
                                { id: 'categories', label: 'Categories', icon: PieChart }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center space-x-2 py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${activeTab === tab.id
                                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                                        }`}
                                >
                                    <tab.icon className="w-4 h-4" />
                                    <span>{tab.label}</span>
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Tab Content */}
                    <div className="space-y-6">
                        {activeTab === 'overview' && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Revenue Chart */}
                                <ChartCard title="Monthly Revenue Trend">
                                    <div className="space-y-4">
                                        {analyticsData.monthlyRevenue.map((item, index) => (
                                            <div key={index} className="flex items-center justify-between">
                                                <span className="text-sm text-gray-600 dark:text-gray-400">{item.month}</span>
                                                <div className="flex items-center space-x-4 flex-1 mx-4">
                                                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                        <div
                                                            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                                                            style={{ width: `${(item.revenue / 70000) * 100}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                        ${item.revenue.toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </ChartCard>

                                {/* Category Distribution */}
                                <ChartCard title="Course Categories">
                                    <div className="space-y-3">
                                        {analyticsData.categoryStats.map((category, index) => (
                                            <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                                <div className="flex items-center space-x-3">
                                                    <div
                                                        className="w-4 h-4 rounded-full"
                                                        style={{ backgroundColor: category.color }}
                                                    ></div>
                                                    <span className="font-medium text-gray-900 dark:text-white">{category.name}</span>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {category.courses} courses
                                                    </div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                        {category.students} students
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </ChartCard>
                            </div>
                        )}

                        {activeTab === 'courses' && (
                            <ChartCard title="Top Performing Courses">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-gray-200 dark:border-gray-700">
                                                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Course</th>
                                                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Tutor</th>
                                                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Students</th>
                                                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Revenue</th>
                                                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Rating</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {analyticsData.topCourses.map((course) => (
                                                <tr key={course.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                                    <td className="py-4 px-4">
                                                        <div className="flex items-center space-x-3">
                                                            <img src={course.thumbnail} alt={course.title} className="w-12 h-12 object-cover rounded-lg" />
                                                            <div>
                                                                <div className="font-medium text-gray-900 dark:text-white">{course.title}</div>
                                                                <div className="text-sm text-gray-500 dark:text-gray-400">by {course.tutor}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-4 text-gray-900 dark:text-white">{course.tutor}</td>
                                                    <td className="py-4 px-4 text-gray-900 dark:text-white">{course.students.toLocaleString()}</td>
                                                    <td className="py-4 px-4 text-gray-900 dark:text-white">${course.revenue.toLocaleString()}</td>
                                                    <td className="py-4 px-4">
                                                        <div className="flex items-center space-x-1">
                                                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                                            <span className="text-gray-900 dark:text-white">{course.rating}</span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </ChartCard>
                        )}

                        {activeTab === 'tutors' && (
                            <ChartCard title="Top Performing Tutors">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {analyticsData.topTutors.map((tutor) => (
                                        <div key={tutor.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-all duration-300">
                                            <div className="flex items-center space-x-3 mb-3">
                                                <img src={tutor.avatar} alt={tutor.name} className="w-12 h-12 object-cover rounded-full" />
                                                <div>
                                                    <h4 className="font-medium text-gray-900 dark:text-white">{tutor.name}</h4>
                                                    <div className="flex items-center space-x-1">
                                                        <Star className="w-3 h-3 text-yellow-400 fill-current" />
                                                        <span className="text-sm text-gray-600 dark:text-gray-400">{tutor.rating}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600 dark:text-gray-400">Courses:</span>
                                                    <span className="font-medium text-gray-900 dark:text-white">{tutor.courses}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600 dark:text-gray-400">Students:</span>
                                                    <span className="font-medium text-gray-900 dark:text-white">{tutor.students.toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600 dark:text-gray-400">Revenue:</span>
                                                    <span className="font-medium text-green-600">${tutor.revenue.toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </ChartCard>
                        )}

                        {activeTab === 'transactions' && (
                            <ChartCard title="Recent Transactions">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-gray-200 dark:border-gray-700">
                                                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Student</th>
                                                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Course</th>
                                                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Amount</th>
                                                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Date</th>
                                                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {analyticsData.recentTransactions.map((transaction) => (
                                                <tr key={transaction.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                                    <td className="py-4 px-4 text-gray-900 dark:text-white">{transaction.student}</td>
                                                    <td className="py-4 px-4 text-gray-900 dark:text-white">{transaction.course}</td>
                                                    <td className="py-4 px-4 text-gray-900 dark:text-white">${transaction.amount}</td>
                                                    <td className="py-4 px-4 text-gray-600 dark:text-gray-400">{transaction.date}</td>
                                                    <td className="py-4 px-4">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${transaction.status === 'completed'
                                                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                                            : transaction.status === 'pending'
                                                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                                                                : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                                                            }`}>
                                                            {transaction.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </ChartCard>
                        )}

                        {activeTab === 'categories' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <ChartCard title="Category Performance">
                                    <div className="space-y-4">
                                        {analyticsData.categoryStats.map((category, index) => (
                                            <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center space-x-2">
                                                        <div
                                                            className="w-3 h-3 rounded-full"
                                                            style={{ backgroundColor: category.color }}
                                                        ></div>
                                                        <span className="font-medium text-gray-900 dark:text-white">{category.name}</span>
                                                    </div>
                                                    <span className="text-sm text-green-600 font-medium">${category.revenue.toLocaleString()}</span>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <span className="text-gray-600 dark:text-gray-400">Courses: </span>
                                                        <span className="font-medium text-gray-900 dark:text-white">{category.courses}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-600 dark:text-gray-400">Students: </span>
                                                        <span className="font-medium text-gray-900 dark:text-white">{category.students}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </ChartCard>

                                <ChartCard title="Revenue Distribution">
                                    <div className="space-y-3">
                                        {analyticsData.categoryStats.map((category, index) => (
                                            <div key={index} className="flex items-center space-x-3">
                                                <div
                                                    className="w-4 h-4 rounded-full flex-shrink-0"
                                                    style={{ backgroundColor: category.color }}
                                                ></div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className="text-sm font-medium text-gray-900 dark:text-white">{category.name}</span>
                                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                                            {((category.revenue / analyticsData.categoryStats.reduce((sum, cat) => sum + cat.revenue, 0)) * 100).toFixed(1)}%
                                                        </span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                        <div
                                                            className="h-2 rounded-full transition-all duration-500"
                                                            style={{
                                                                backgroundColor: category.color,
                                                                width: `${(category.revenue / Math.max(...analyticsData.categoryStats.map(c => c.revenue))) * 100}%`
                                                            }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </ChartCard>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default AdminAnalyticsView;