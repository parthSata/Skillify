// src/components/CategoryForm.tsx

import React, { useState, useEffect } from 'react';

interface CategoryFormProps {
    category?: {
        _id?: string;
        name: string;
        slug: string;
    };
    onSubmit: (categoryData: any) => void;
    onCancel: () => void;
    isEditing?: boolean;
}

// Helper function to create a slug from a name
const createSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-*|-*$/g, '');
};

const CategoryForm: React.FC<CategoryFormProps> = ({
    category,
    onSubmit,
    onCancel,
    isEditing = false
}) => {
    const [formData, setFormData] = useState({
        name: category?.name || '',
        slug: category?.slug || ''
    });

    // Update slug whenever the name changes
    useEffect(() => {
        setFormData(prev => ({ ...prev, slug: createSlug(prev.name) }));
    }, [formData.name]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category Name
                </label>
                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Enter category name"
                    required
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Slug
                </label>
                <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    readOnly
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Auto-generated slug"
                />
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                    {isEditing ? 'Update Category' : 'Create Category'}
                </button>
            </div>
        </form>
    );
};

export default CategoryForm;