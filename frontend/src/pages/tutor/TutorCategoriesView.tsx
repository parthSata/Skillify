// frontend/src/pages/tutor/TutorCategoriesView.tsx

import React, { useState, useEffect } from 'react';
import { TutorCategoriesList } from '@/components/index';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const API_BASE_URL = 'http://localhost:3000/api/v1';

// Interface for data received directly from the API
interface APIResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

// Updated interface to match your actual Category model
interface API_Category {
    _id: string;
    name: string;
    slug: string;
}

// Interface for the data used by the component (list props)
interface Category {
    id: string;
    name: string;
    description: string;
    color: string;
    iconUrl: string; // Changed to iconUrl for online image links
    courses: number;
}

const TutorCategoriesView: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setLoading(true);
                const response = await axios.get<APIResponse<API_Category[]>>(`${API_BASE_URL}/categories`);
                console.log("🚀 ~ fetchCategories ~ response:", response.data.data)

                if (response.data.success) {
                    const validCategories = response.data.data.filter(Boolean);

                    const formattedCategories: Category[] = validCategories.map(cat => ({
                        id: cat._id,
                        name: cat.name,
                        description: `A description for ${cat.name}`,
                        color: '#4B5563',
                        // Generate a dynamic, unique icon URL based on the category name
                        iconUrl: `https://dummyimage.com/100x100/3B82F6/fff.png&text=${cat.name.charAt(0)}`,
                        courses: 0,
                    }));
                    setCategories(formattedCategories);
                } else {
                    setError(response.data.message || 'Failed to fetch categories.');
                }
            } catch (err: any) {
                console.error('Failed to fetch categories:', err);
                setError(err.response?.data?.message || 'Failed to fetch categories.');
                toast.error(err.response?.data?.message || 'Failed to fetch categories.');
            } finally {
                setLoading(false);
            }
        };
        fetchCategories();
    }, []);

    if (loading) {
        return <div className="p-6 text-center text-gray-500 dark:text-gray-400">Loading categories...</div>;
    }

    if (error) {
        return <div className="p-6 text-center text-red-500 dark:text-red-400">Error: {error}</div>;
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Course Categories</h1>
            <TutorCategoriesList categories={categories} />
        </div>
    );
};

export default TutorCategoriesView;