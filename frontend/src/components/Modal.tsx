import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    children,
    size = 'md'
}) => {
    if (!isOpen) return null;

    const sizeClasses = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl'
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto  bg-opacity-50">
            <div
                className="fixed inset-0 backdrop-blur-sm transition-opacity duration-300"
                onClick={onClose}
            ></div>
            <div className={`
                inline-block w-full ${sizeClasses[size]}
                my-4 mx-4 sm:mx-6 md:mx-8 lg:mx-12 p-4 sm:p-6 md:p-8
                overflow-y-auto max-h-[90vh] rounded-lg
                bg-white dark:bg-gray-800 shadow-xl transform
                transition-all duration-300 z-50
            `}>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                        {title}
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
};