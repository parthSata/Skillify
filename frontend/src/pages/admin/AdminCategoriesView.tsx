// src/components/AdminCategoriesView.tsx

import React, { useState } from 'react';
import { Edit, Trash2, Tag, Plus } from 'lucide-react';
import { Modal } from '@/components/Modal';
import { CategoryForm } from '@/components/index';



const AdminCategoriesView: React.FC = () => {
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState<any>(null);

    const categories = [
        { id: '1', name: 'Web Development', description: 'Frontend and backend development', color: '#3B82F6', icon: 'Code', courses: 45 },
        { id: '2', name: 'Data Science', description: 'Analytics and machine learning', color: '#10B981', icon: 'BarChart3', courses: 32 },
        { id: '3', name: 'Design', description: 'UI/UX and graphic design', color: '#8B5CF6', icon: 'Palette', courses: 28 },
    ];

    const handleCategorySubmit = (categoryData: any) => {
        console.log('Category submitted:', categoryData);
        setShowCategoryModal(false);
        setEditingCategory(null);
    };

    const handleEditCategory = (category: any) => {
        setEditingCategory(category);
        setShowCategoryModal(true);
    };

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Category Management</h1>
                <button
                    onClick={() => setShowCategoryModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                >
                    <Plus className="w-5 h-5" />
                    <span>Add Category</span>
                </button>
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
};

export default AdminCategoriesView;