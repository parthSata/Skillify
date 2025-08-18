// frontend/src/components/TutorCategoriesList.tsx
// (No changes needed in this file)

import React from 'react';

interface Category {
    id: string;
    name: string;
    description: string;
    color: string;
    iconUrl: string;
    courses: number;
}

interface TutorCategoriesListProps {
    categories: Category[];
}

const TutorCategoriesList: React.FC<TutorCategoriesListProps> = ({ categories }) => {
    return (
        <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Category
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Courses
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {categories.map((category) => {
                        if (!category || !category.color) return null;

                        return (
                            <tr key={category.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className={`flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-${category.color.toLowerCase().slice(1)}-100 dark:bg-${category.color.toLowerCase().slice(1)}-900`}>
                                            <img
                                                src={category.iconUrl}
                                                alt={`${category.name} icon`}
                                                className="h-6 w-6"
                                            />
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">{category.name}</div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">{category.description}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                    {category.courses}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default TutorCategoriesList;