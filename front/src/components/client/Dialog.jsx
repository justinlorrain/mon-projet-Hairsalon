import React, { useState } from 'react';
import { X } from 'lucide-react';

export const Dialog = ({
    isOpen,
    onClose,
    title,
    description,
    children,
    onConfirm,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'default'
}) => {
    if (!isOpen) return null;

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in-0"
            onClick={handleOverlayClick}
        >
            <div
                className="relative w-full max-w-lg rounded-2xl border bg-white p-6 shadow-2xl 
                           animate-in zoom-in-95 slide-in-from-top-10"
            >

                <div className="flex items-start justify-between mb-4">
                    <div className="space-y-1.5">
                        <h2 className="text-2xl font-semibold  tracking-tight">
                            {title}
                        </h2>
                        {description && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {description}
                            </p>
                        )}
                    </div>


                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 
                                   rounded-full p-1.5 transition-colors 
                                   hover:bg-gray-100 dark:hover:bg-gray-800 
                                   focus:outline-none focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-700"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>


                <div className="mb-6 ">
                    {children}
                </div>


                <div className="flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium 
                                   text-gray-600 dark:text-gray-300
                                   bg-white dark:bg-gray-800 
                                   border border-gray-200 dark:border-gray-700
                                   rounded-md 
                                   hover:bg-gray-50 dark:hover:bg-gray-700 
                                   transition-colors 
                                   focus:outline-none focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-600"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`px-4 py-2 text-sm font-medium rounded-md 
                                   transition-colors 
                                   focus:outline-none focus:ring-2 
                                   ${variant === 'destructive'
                                ? 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-200 dark:focus:ring-red-900'
                                : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-200 dark:focus:ring-blue-900'
                            }`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};