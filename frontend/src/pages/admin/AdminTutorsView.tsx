// src/pages/admin/AdminTutorsView.tsx

import React, { useState, useEffect } from 'react';
import { Trash2, Check, Loader2 } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { ConfirmationDialog } from '@/components/ConfirmationDialog';

interface Tutor {
    _id: string;
    name: string;
    email: string;
    isApproved: boolean;
}

interface ApiResponse<T> {
    data: T;
    message: string;
    success: boolean;
}

axios.defaults.withCredentials = true;

const AdminTutorsView: React.FC = () => {
    const [tutors, setTutors] = useState<Tutor[]>([]);
    const [loading, setLoading] = useState(true);
    const [showApproveDialog, setShowApproveDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [tutorToApproveId, setTutorToApproveId] = useState<string | null>(null);
    const [tutorToDeleteId, setTutorToDeleteId] = useState<string | null>(null);

    const fetchTutors = async () => {
        try {
            setLoading(true);
            const response = await axios.get<ApiResponse<Tutor[]>>('http://localhost:3000/api/v1/admin/tutors');
            setTutors(response.data.data || []);
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to fetch tutors.');
            setTutors([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTutors();
    }, []);

    const handleApproveClick = (tutorId: string) => {
        setTutorToApproveId(tutorId);
        setShowApproveDialog(true);
    };

    const handleConfirmApprove = async () => {
        if (!tutorToApproveId) return;
        try {
            await axios.patch(`http://localhost:3000/api/v1/admin/tutors/approve/${tutorToApproveId}`);
            toast.success('Tutor approved successfully!');
            fetchTutors();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to approve tutor.');
        } finally {
            setShowApproveDialog(false);
            setTutorToApproveId(null);
        }
    };

    const handleCancelApprove = () => {
        setShowApproveDialog(false);
        setTutorToApproveId(null);
    };

    const handleDeleteClick = (tutorId: string) => {
        setTutorToDeleteId(tutorId);
        setShowDeleteDialog(true);
    };

    const handleConfirmDelete = async () => {
        if (!tutorToDeleteId) return;
        try {
            await axios.delete(`http://localhost:3000/api/v1/admin/users/${tutorToDeleteId}`);
            toast.success('Tutor deleted successfully!');
            fetchTutors();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to delete tutor.');
        } finally {
            setShowDeleteDialog(false);
            setTutorToDeleteId(null);
        }
    };

    const handleCancelDelete = () => {
        setShowDeleteDialog(false);
        setTutorToDeleteId(null);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Tutor Management</h1>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
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
                            {tutors?.map((tutor) => (
                                <tr key={tutor._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{tutor.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{tutor.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${tutor.isApproved
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                                            }`}>
                                            {tutor.isApproved ? 'approved' : 'pending'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex items-center space-x-2">
                                            {!tutor.isApproved && (
                                                <button
                                                    onClick={() => handleApproveClick(tutor._id)}
                                                    className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                                                    title="Approve Tutor"
                                                >
                                                    <Check className="w-4 h-4" />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDeleteClick(tutor._id)}
                                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                                title="Delete Tutor"
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
            </div>
            {showApproveDialog && (
                <ConfirmationDialog
                    title="Confirm Approval"
                    message="Are you sure you want to approve this tutor? The tutor will be able to log in after approval."
                    onConfirm={handleConfirmApprove}
                    onCancel={handleCancelApprove}
                />
            )}
            {showDeleteDialog && (
                <ConfirmationDialog
                    title="Confirm Deletion"
                    message="Are you sure you want to delete this tutor? This action cannot be undone."
                    onConfirm={handleConfirmDelete}
                    onCancel={handleCancelDelete}
                />
            )}
        </div>
    );
};

export default AdminTutorsView;