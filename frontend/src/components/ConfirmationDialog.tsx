// src/components/ConfirmationDialog.tsx

import React from 'react';
import { X } from 'lucide-react';

interface ConfirmationDialogProps {
    isOpen: boolean; // Add the missing isOpen prop
    title: string;
    message: string;
    onConfirm: () => void;
    onClose: () => void; // Renamed from onCancel for consistency
}
export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({ isOpen, title, message, onConfirm, onClose }) => {
    // Return null if the dialog is not open
    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center  bg-opacity-50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-lg  shadow-xl w-full max-w-md p-6 relative">
                <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300">
                        <X size={20} />
                    </button>
                </div>
                <div className="py-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">{message}</p>
                </div>
                <div className="flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
};