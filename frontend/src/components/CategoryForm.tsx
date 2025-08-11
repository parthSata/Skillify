import React, { useState } from 'react';
import { Tag } from 'lucide-react';

interface CategoryFormProps {
    category?: {
        id?: string;
        name: string;
        description: string;
        color: string;
        icon: string;
    };
    onSubmit: (categoryData: any) => void;
    onCancel: () => void;
    isEditing?: boolean;
}

const CategoryForm: React.FC<CategoryFormProps> = ({
    category,
    onSubmit,
    onCancel,
    isEditing = false
}) => {
    const [formData, setFormData] = useState({
        name: category?.name || '',
        description: category?.description || '',
        color: category?.color || '#3B82F6',
        icon: category?.icon || 'BookOpen'
    });

    const colorOptions = [
        { name: 'Blue', value: '#3B82F6' },
        { name: 'Purple', value: '#8B5CF6' },
        { name: 'Green', value: '#10B981' },
        { name: 'Orange', value: '#F59E0B' },
        { name: 'Red', value: '#EF4444' },
        { name: 'Pink', value: '#EC4899' },
        { name: 'Indigo', value: '#6366F1' },
        { name: 'Teal', value: '#14B8A6' }
    ];

    const iconOptions = [
        'BookOpen', 'Code', 'Palette', 'Smartphone', 'Brain',
        'Briefcase', 'TrendingUp', 'Camera', 'Music', 'Globe'
    ];

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
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
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Enter category name"
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                </label>
                <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Enter category description"
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category Color
                </label>
                <div className="grid grid-cols-4 gap-3">
                    {colorOptions.map((color) => (
                        <button
                            key={color.value}
                            type="button"
                            onClick={() => handleInputChange('color', color.value)}
                            className={`p-3 rounded-lg border-2 transition-all duration-200 ${formData.color === color.value
                                ? 'border-gray-900 dark:border-white scale-105'
                                : 'border-gray-300 dark:border-gray-600 hover:scale-105'
                                }`}
                            style={{ backgroundColor: color.value }}
                        >
                            <div className="w-full h-6 rounded flex items-center justify-center">
                                <span className="text-white text-xs font-medium">{color.name}</span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category Icon
                </label>
                <div className="grid grid-cols-5 gap-3">
                    {iconOptions.map((icon) => (
                        <button
                            key={icon}
                            type="button"
                            onClick={() => handleInputChange('icon', icon)}
                            className={`p-3 border-2 rounded-lg transition-all duration-200 ${formData.icon === icon
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                                }`}
                        >
                            <Tag className="w-6 h-6 mx-auto text-gray-600 dark:text-gray-400" />
                            <span className="text-xs mt-1 block text-gray-600 dark:text-gray-400">{icon}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Preview */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Preview</h4>
                <div className="flex items-center space-x-3">
                    <div
                        className="p-2 rounded-lg"
                        style={{ backgroundColor: `${formData.color}20` }}
                    >
                        <Tag className="w-5 h-5" style={{ color: formData.color }} />
                    </div>
                    <div>
                        <h5 className="font-medium text-gray-900 dark:text-white">{formData.name || 'Category Name'}</h5>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{formData.description || 'Category description'}</p>
                    </div>
                </div>
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