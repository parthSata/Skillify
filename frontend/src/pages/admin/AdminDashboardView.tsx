import React, { useState, useEffect } from 'react';
import { BookOpen, Users, DollarSign, TrendingUp, Check, Trash2, Loader2 } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { ConfirmationDialog } from '@/components/ConfirmationDialog';

const API_BASE_URL = 'http://localhost:3000/api/v1';

interface APIResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

interface Tutor {
    _id: string;
    name: string;
    email: string;
    avatar: string;
    isApproved: boolean;
    createdAt: string;
}

interface Review {
    _id: string;
    course: { _id: string; title: string };
    student: { _id: string; name: string; avatar: string };
    rating: number;
    comment: string;
    createdAt: string;
}

interface AdminStatsData {
    totalCourses: number;
    totalStudents: number;
    totalRevenue: number;
    averageRating: number;
}

// Stats card component
const AdminStatsCard: React.FC<{ title: string; value: string | number; icon: React.ElementType; color: string }> = ({ title, value, icon: Icon, color }) => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
                </div>
                <div className={`p-3 rounded-full bg-${color}-100 dark:bg-${color}-900/20`}>
                    <Icon className={`w-6 h-6 text-${color}-600 dark:text-${color}-400`} />
                </div>
            </div>
        </div>
    );
};

const AdminDashboardView: React.FC = () => {
    const [pendingTutors, setPendingTutors] = useState<Tutor[]>([]);
    const [reviewsForModeration, setReviewsForModeration] = useState<Review[]>([]);
    const [stats, setStats] = useState<AdminStatsData | null>(null); // Re-added state for stats
    const [loading, setLoading] = useState(true);

    const [isDeleteReviewDialogOpen, setIsDeleteReviewDialogOpen] = useState(false);
    const [reviewToDelete, setReviewToDelete] = useState<Review | null>(null);

    const [isApproveTutorDialogOpen, setIsApproveTutorDialogOpen] = useState(false);
    const [tutorToApprove, setTutorToApprove] = useState<Tutor | null>(null);
    const [isRejectTutorDialogOpen, setIsRejectTutorDialogOpen] = useState(false);
    const [tutorToReject, setTutorToReject] = useState<Tutor | null>(null);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            // Fetch moderation and stats data in parallel
            const [
                statsResponse,
                tutorsResponse,
                reviewsResponse
            ] = await Promise.all([
                axios.get<APIResponse<AdminStatsData>>(`${API_BASE_URL}/admin/analytics`), // Re-added analytics fetch
                axios.get<APIResponse<Tutor[]>>(`${API_BASE_URL}/admin/tutors/pending`),
                axios.get<APIResponse<Review[]>>(`${API_BASE_URL}/admin/reviews/pending`)
            ]);

            setStats(statsResponse.data.data); // Set the stats state
            setPendingTutors(tutorsResponse.data.data || []);
            setReviewsForModeration(reviewsResponse.data.data || []);

        } catch (error) {
            console.error('Failed to fetch admin dashboard data:', error);
            toast.error('Failed to load dashboard data.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    // Handlers for Tutor Approval
    const handleApproveTutorClick = (tutor: Tutor) => {
        setTutorToApprove(tutor);
        setIsApproveTutorDialogOpen(true);
    };

    const handleConfirmApproveTutor = async () => {
        if (!tutorToApprove) return;
        try {
            await axios.patch<APIResponse<any>>(`${API_BASE_URL}/admin/tutors/approve/${tutorToApprove._id}`);
            toast.success('Tutor approved successfully.');
            fetchDashboardData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to approve tutor.');
        } finally {
            setIsApproveTutorDialogOpen(false);
            setTutorToApprove(null);
        }
    };

    const handleRejectTutorClick = (tutor: Tutor) => {
        setTutorToReject(tutor);
        setIsRejectTutorDialogOpen(true);
    };

    const handleConfirmRejectTutor = async () => {
        if (!tutorToReject) return;
        try {
            await axios.delete<APIResponse<any>>(`${API_BASE_URL}/admin/users/${tutorToReject._id}`);
            toast.success('Tutor rejected and deleted successfully.');
            fetchDashboardData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to reject tutor.');
        } finally {
            setIsRejectTutorDialogOpen(false);
            setTutorToReject(null);
        }
    };

    // Handlers for Review Moderation
    const handleApproveReview = async (review: Review) => {
        try {
            await axios.patch<APIResponse<any>>(`${API_BASE_URL}/admin/reviews/${review._id}/approve`);
            toast.success('Review approved successfully.');
            fetchDashboardData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to approve review.');
        }
    };

    const handleDeleteReviewClick = (review: Review) => {
        setReviewToDelete(review);
        setIsDeleteReviewDialogOpen(true);
    };

    const handleConfirmDeleteReview = async () => {
        if (!reviewToDelete) return;
        try {
            await axios.delete<APIResponse<any>>(`${API_BASE_URL}/admin/reviews/${reviewToDelete._id}/delete`);
            toast.success('Review deleted successfully.');
            fetchDashboardData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to delete review.');
        } finally {
            setIsDeleteReviewDialogOpen(false);
            setReviewToDelete(null);
        }
    };

    const adminStats = stats ? [
        { title: 'Total Courses', value: stats.totalCourses, icon: BookOpen, color: 'blue' },
        { title: 'Total Students', value: stats.totalStudents, icon: Users, color: 'green' },
        { title: 'Total Revenue', value: `${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'purple' },
        { title: 'Average Rating', value: stats.averageRating.toFixed(1), icon: TrendingUp, color: 'orange' },
    ] : [];

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>

            {/* Dynamic Stats Cards */}
            <div className="grid md:grid-cols-4 gap-6">
                {adminStats.map((stat, index) => (
                    <AdminStatsCard key={index} {...stat} />
                ))}
            </div>

            {/* Tutor Approval Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Pending Tutor Approvals ({pendingTutors.length})</h3>
                {pendingTutors.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {pendingTutors.map((tutor) => (
                                    <tr key={tutor._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{tutor.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{tutor.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                                                pending
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => handleApproveTutorClick(tutor)}
                                                    className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                                                    title="Approve Tutor"
                                                >
                                                    <Check className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleRejectTutorClick(tutor)}
                                                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                                    title="Reject Tutor"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center text-gray-500 dark:text-gray-400">No pending tutors.</div>
                )}
            </div>

            {/* Review Moderation Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Reviews for Moderation ({reviewsForModeration.length})</h3>
                {reviewsForModeration.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Course Title</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Student Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Comment</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {reviewsForModeration.map((review) => (
                                    <tr key={review._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{review.course.title}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{review.student.name}</td>
                                        <td className="px-6 py-4 max-w-xs overflow-hidden text-ellipsis text-sm text-gray-500 dark:text-gray-400">
                                            {review.comment}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => handleApproveReview(review)}
                                                    className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                                                    title="Approve Review"
                                                >
                                                    <Check className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteReviewClick(review)}
                                                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                                    title="Delete Review"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center text-gray-500 dark:text-gray-400">No reviews for moderation.</div>
                )}
            </div>

            <ConfirmationDialog
                isOpen={isApproveTutorDialogOpen}
                onClose={() => setIsApproveTutorDialogOpen(false)}
                onConfirm={handleConfirmApproveTutor}
                title="Confirm Tutor Approval"
                message={`Are you sure you want to approve "${tutorToApprove?.name}"? They will gain access to the platform.`}
            />

            <ConfirmationDialog
                isOpen={isRejectTutorDialogOpen}
                onClose={() => setIsRejectTutorDialogOpen(false)}
                onConfirm={handleConfirmRejectTutor}
                title="Confirm Tutor Rejection"
                message={`Are you sure you want to reject "${tutorToReject?.name}"? Their account will be permanently deleted.`}
            />

            <ConfirmationDialog
                isOpen={isDeleteReviewDialogOpen}
                onClose={() => setIsDeleteReviewDialogOpen(false)}
                onConfirm={handleConfirmDeleteReview}
                title="Confirm Review Deletion"
                message={`Are you sure you want to delete this review? This action cannot be undone.`}
            />
        </div>
    );
};

export default AdminDashboardView;