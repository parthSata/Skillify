// src/components/AdminCategoriesView.tsx

import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Tag, Plus, Loader2 } from 'lucide-react';
import { Modal } from '@/components/Modal';
import { CategoryForm, ConfirmationDialog } from '@/components/index';
import axios from 'axios';
import { toast } from 'react-hot-toast';

interface Category {
    _id: string;
    name: string;
    slug: string;
    // Add other fields as per your schema if needed, but remove the static ones
}

interface ApiResponse<T> {
    data: T;
    message: string;
    success: boolean;
}

const API_BASE_URL = 'http://localhost:3000/api/v1';

const AdminCategoriesView: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState<any>(null);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await axios.get<ApiResponse<Category[]>>(`${API_BASE_URL}/categories`);
            setCategories(response.data.data || []);
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to fetch categories.');
            setCategories([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleCategorySubmit = async (categoryData: any) => {
        try {
            // For now, we only have creation. You can add update logic here later
            await axios.post(`${API_BASE_URL}/categories`, categoryData);
            toast.success('Category created successfully!');
            fetchCategories(); // Refresh the list
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to create category.');
        } finally {
            setShowCategoryModal(false);
            setEditingCategory(null);
        }
    };

    const handleEditCategory = (category: any) => {
        setEditingCategory(category);
        setShowCategoryModal(true);
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
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Category Management</h1>
                <button
                    onClick={() => {
                        setEditingCategory(null);
                        setShowCategoryModal(true);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                >
                    <Plus className="w-5 h-5" />
                    <span>Add Category</span>
                </button>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.length > 0 ? (
                    categories.map((category) => (
                        <div key={category._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 hover:shadow-lg transition-all duration-300">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 rounded-lg bg-blue-100">
                                    <Tag className="w-6 h-6 text-blue-600" />
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
                            <p className="text-sm text-gray-600 dark:text-gray-400">Slug: {category.slug}</p>
                        </div>
                    ))
                ) : (
                    <div className="md:col-span-3 text-center text-gray-500 dark:text-gray-400">No categories found.</div>
                )}
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
};

export default AdminCategoriesView;