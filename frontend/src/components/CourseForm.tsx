import React, { useState } from 'react';
import { Plus, Trash2, Video  } from 'lucide-react';

interface Lecture {
    id: string;
    title: string;
    duration: string;
    videoUrl: string;
    description: string;
}

interface CourseFormProps {
    course?: {
        id?: string;
        title: string;
        description: string;
        category: string;
        price: number;
        thumbnail: string;
        lectures: Lecture[];
    };
    onSubmit: (courseData: any) => void;
    onCancel: () => void;
    isEditing?: boolean;
}

export const CourseForm: React.FC<CourseFormProps> = ({
    course,
    onSubmit,
    onCancel,
    isEditing = false
}) => {
    const [formData, setFormData] = useState({
        title: course?.title || '',
        description: course?.description || '',
        category: course?.category || '',
        price: course?.price || 0,
        thumbnail: course?.thumbnail || '',
        lectures: course?.lectures || []
    });

    const [newLecture, setNewLecture] = useState({
        title: '',
        duration: '',
        videoUrl: '',
        description: ''
    });

    const categories = [
        'Web Development',
        'Data Science',
        'Design',
        'Mobile Development',
        'AI/ML',
        'Business',
        'Marketing',
        'Photography'
    ];

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const addLecture = () => {
        if (newLecture.title && newLecture.duration) {
            const lecture: Lecture = {
                id: Date.now().toString(),
                ...newLecture
            };
            setFormData(prev => ({
                ...prev,
                lectures: [...prev.lectures, lecture]
            }));
            setNewLecture({ title: '', duration: '', videoUrl: '', description: '' });
        }
    };

    const removeLecture = (lectureId: string) => {
        setFormData(prev => ({
            ...prev,
            lectures: prev.lectures.filter(l => l.id !== lectureId)
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Course Info */}
            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Course Title
                    </label>
                    <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="Enter course title"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Category
                    </label>
                    <select
                        value={formData.category}
                        onChange={(e) => handleInputChange('category', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        required
                    >
                        <option value="">Select Category</option>
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                </label>
                <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Enter course description"
                    required
                />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Price ($)
                    </label>
                    <input
                        type="number"
                        value={formData.price}
                        onChange={(e) => handleInputChange('price', parseFloat(e.target.value))}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Thumbnail URL
                    </label>
                    <input
                        type="url"
                        value={formData.thumbnail}
                        onChange={(e) => handleInputChange('thumbnail', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="https://example.com/image.jpg"
                    />
                </div>
            </div>

            {/* Lectures Section */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Course Lectures</h4>

                {/* Add New Lecture */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
                    <h5 className="font-medium text-gray-900 dark:text-white mb-3">Add New Lecture</h5>
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <input
                            type="text"
                            value={newLecture.title}
                            onChange={(e) => setNewLecture(prev => ({ ...prev, title: e.target.value }))}
                            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white"
                            placeholder="Lecture title"
                        />
                        <input
                            type="text"
                            value={newLecture.duration}
                            onChange={(e) => setNewLecture(prev => ({ ...prev, duration: e.target.value }))}
                            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white"
                            placeholder="Duration (e.g., 15 min)"
                        />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <input
                            type="url"
                            value={newLecture.videoUrl}
                            onChange={(e) => setNewLecture(prev => ({ ...prev, videoUrl: e.target.value }))}
                            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white"
                            placeholder="Video URL"
                        />
                        <input
                            type="text"
                            value={newLecture.description}
                            onChange={(e) => setNewLecture(prev => ({ ...prev, description: e.target.value }))}
                            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white"
                            placeholder="Lecture description"
                        />
                    </div>
                    <button
                        type="button"
                        onClick={addLecture}
                        className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Add Lecture</span>
                    </button>
                </div>

                {/* Existing Lectures */}
                <div className="space-y-3">
                    {formData.lectures.map((lecture, index) => (
                        <div key={lecture.id} className="flex items-center space-x-4 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                                <Video className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="flex-1">
                                <h6 className="font-medium text-gray-900 dark:text-white">{lecture.title}</h6>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {lecture.duration} • {lecture.description || 'No description'}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => removeLecture(lecture.id)}
                                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
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
                    {isEditing ? 'Update Course' : 'Create Course'}
                </button>
            </div>
        </form>
    );
};