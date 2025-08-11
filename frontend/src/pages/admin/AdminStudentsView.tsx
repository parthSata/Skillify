// src/pages/admin/AdminStudentsView.tsx

import React, { useState, useEffect } from 'react';
import { Trash2, Loader2 } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { ConfirmationDialog } from '@/components/ConfirmationDialog';

interface Student {
    _id: string;
    name: string;
    email: string;
}

interface ApiResponse<T> {
    data: T;
    message: string;
    success: boolean;
}

axios.defaults.withCredentials = true;

const AdminStudentsView: React.FC = () => {
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [studentToDeleteId, setStudentToDeleteId] = useState<string | null>(null);

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const response = await axios.get<ApiResponse<Student[]>>('http://localhost:3000/api/v1/admin/students');
            setStudents(response.data.data || []);
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to fetch students.');
            setStudents([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    const handleDeleteClick = (studentId: string) => {
        setStudentToDeleteId(studentId);
        setShowDeleteDialog(true);
    };

    const confirmDelete = async () => {
        if (!studentToDeleteId) return;
        try {
            await axios.delete(`http://localhost:3000/api/v1/admin/users/${studentToDeleteId}`);
            toast.success('Student deleted successfully!');
            fetchStudents();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to delete student.');
        } finally {
            setShowDeleteDialog(false);
            setStudentToDeleteId(null);
        }
    };

    const cancelDelete = () => {
        setShowDeleteDialog(false);
        setStudentToDeleteId(null);
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Student Management</h1>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {students?.map((student) => (
                                <tr key={student._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{student.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{student.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button
                                            onClick={() => handleDeleteClick(student._id)}
                                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                            title="Delete Student"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {showDeleteDialog && (
                <ConfirmationDialog
                    title="Confirm Deletion"
                    message="Are you sure you want to delete this student? This action cannot be undone."
                    onConfirm={confirmDelete}
                    onCancel={cancelDelete}
                />
            )}
        </div>
    );
};

export default AdminStudentsView;