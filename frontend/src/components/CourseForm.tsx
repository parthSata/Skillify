// src/components/CourseForm.tsx

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Video } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axios from 'axios';

interface Lecture {
    id: string;
    title: string;
    duration: string;
    videoUrl: string | null;
    videoFile?: File | null;
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
    onSubmit: (courseData: FormData) => void;
    onCancel: () => void;
    isEditing?: boolean;
}

interface Category {
    _id: string;
    name: string;
}

const API_BASE_URL = 'http://localhost:3000/api/v1';

const CourseForm: React.FC<CourseFormProps> = ({
    course,
    onSubmit,
    onCancel,
    isEditing = false
}) => {
    const [categories, setCategories] = useState<Category[]>([]);

    // Fetch categories on component mount
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get<any>(`${API_BASE_URL}/categories`);
                if (response.data.success) {
                    setCategories(response.data.data);
                } else {
                    toast.error(response.data.message || 'Failed to fetch categories.');
                }
            } catch (err: any) {
                toast.error(err.response?.data?.message || 'Failed to fetch categories.');
            }
        };
        fetchCategories();
    }, []);

    const [formData, setFormData] = useState({
        title: course?.title || '',
        description: course?.description || '',
        category: course?.category || '',
        price: course?.price || 0,
        thumbnailFile: null as File | null,
        lectures: course?.lectures || []
    });

    const [newLecture, setNewLecture] = useState({
        title: '',
        duration: '',
        videoFile: null as File | null,
        description: ''
    });

    useEffect(() => {
        if (isEditing && course) {
            setFormData(prev => ({
                ...prev,
                title: course.title,
                description: course.description,
                category: course.category,
                price: course.price,
                lectures: course.lectures.map(l => ({ ...l, videoFile: null }))
            }));
        }
    }, [isEditing, course]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, lectureIndex?: number) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const name = e.target.name;
        let limit = 0;
        let fileType = '';

        if (name === 'thumbnailFile') {
            limit = 10 * 1024 * 1024; // 10 MB
            fileType = 'Thumbnail';
        } else if (name === 'videoFile') {
            limit = 100 * 1024 * 1024; // 100 MB
            fileType = 'Video';
        }

        if (file.size > limit) {
            toast.error(`${fileType} size must be less than ${limit / 1024 / 1024}MB.`);
            e.target.value = '';
            return;
        }

        if (lectureIndex !== undefined) {
            const updatedLectures = [...formData.lectures];
            updatedLectures[lectureIndex].videoFile = file;
            setFormData(prev => ({ ...prev, lectures: updatedLectures }));
        } else {
            setFormData(prev => ({ ...prev, [name]: file }));
        }
    };

    const addNewLecture = () => {
        if (newLecture.title && newLecture.duration) {
            const lecture: Lecture = {
                id: Date.now().toString(),
                ...newLecture,
                videoUrl: null,
            };
            setFormData(prev => ({
                ...prev,
                lectures: [...prev.lectures, lecture]
            }));
            setNewLecture({ title: '', duration: '', videoFile: null, description: '' });
        } else {
            toast.error("Lecture title and duration are required.");
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

        const courseData = new FormData();
        courseData.append('title', formData.title);
        courseData.append('description', formData.description);
        courseData.append('category', formData.category);
        courseData.append('price', formData.price.toString());

        if (formData.thumbnailFile) {
            courseData.append('thumbnail', formData.thumbnailFile);
        }

        formData.lectures.forEach((lecture, index) => {
            courseData.append(`lectures[${index}][title]`, lecture.title);
            courseData.append(`lectures[${index}][duration]`, lecture.duration);
            courseData.append(`lectures[${index}][description]`, lecture.description);
            if (lecture.videoFile) {
                courseData.append(`lectures[${index}][video]`, lecture.videoFile);
            }
        });

        onSubmit(courseData);
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4 sm:p-6">
            <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <label htmlFor="course-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Course Title
                        </label>
                        <input
                            id="course-title"
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            placeholder="Enter course title"
                            required
                        />
                    </div>
                    <div className="flex-1">
                        <label htmlFor="course-category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Category
                        </label>
                        <select
                            id="course-category"
                            name="category"
                            value={formData.category}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            required
                        >
                            <option value="">Select Category</option>
                            {categories.map(cat => (
                                <option key={cat._id} value={cat._id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="flex-1">
                    <label htmlFor="course-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Description
                    </label>
                    <textarea
                        id="course-description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="Enter course description"
                        required
                    />
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <label htmlFor="course-price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Price
                        </label>
                        <input
                            id="course-price"
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                            required
                        />
                    </div>
                    <div className="flex-1">
                        <label htmlFor="course-thumbnail" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Thumbnail Image (max 10MB)
                        </label>
                        <input
                            id="course-thumbnail"
                            type="file"
                            name="thumbnailFile"
                            onChange={(e) => handleFileChange(e)}
                            className="w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            accept="image/*"
                            required
                        />
                    </div>
                </div>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Course Lectures</h4>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
                    <h5 className="font-medium text-gray-900 dark:text-white mb-3">Add New Lecture</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <input
                            type="file"
                            name="videoFile"
                            onChange={(e) => handleFileChange(e)}
                            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white"
                            accept="video/*"
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
                        onClick={addNewLecture}
                        className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Add Lecture</span>
                    </button>
                </div>
                <div className="space-y-3">
                    {formData.lectures.map((lecture) => (
                        <div key={lecture.id} className="flex flex-col sm:flex-row items-center space-x-0 sm:space-x-4 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg mb-2 sm:mb-0">
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
                                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors mt-2 sm:mt-0"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
            <div className="flex flex-col sm:flex-row justify-end items-center sm:items-stretch space-y-2 sm:space-y-0 sm:space-x-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                    type="button"
                    onClick={onCancel}
                    className="w-full sm:w-auto px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                    {isEditing ? 'Update Course' : 'Create Course'}
                </button>
            </div>
        </form>
    );
};

export default CourseForm;