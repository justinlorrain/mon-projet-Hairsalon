import React from 'react'
import { cn } from '../utils/utils';


export const Dialog = ({ open, onOpenChange, children }) => {
    React.useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && open) {
                onOpenChange(false);
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [open, onOpenChange]);

    if (!open) return null;

    return (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50">
            <DialogOverlay onClick={() => onOpenChange(false)} />
            {children}
        </div>
    );
};

export const DialogTrigger = ({ children, onClick }) => {
    return <button onClick={onClick}>{children}</button>;
};

export const DialogOverlay = ({ className, onClick, ...props }) => {
    return (
        <div
            onClick={onClick}
            className={cn(
                "fixed inset-0 z-40 bg-black/50 backdrop-blur-sm",
                className
            )}
            {...props}
        />
    );
};

export const DialogContent = ({ children, className, ...props }) => {
    return (
        <div
            className={cn(
                "fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-lg border border-slate-200 bg-white p-6 shadow-2xl animate-in fade-in-90 slide-in-from-bottom-10",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
};

export const DialogHeader = ({ children, className, ...props }) => {
    return (
        <div
            className={cn(
                "flex flex-col space-y-1.5 text-center sm:text-left mb-4",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
};

export const DialogFooter = ({ children, className, ...props }) => {
    return (
        <div
            className={cn(
                "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-4",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
};

export const DialogTitle = ({ children, className, ...props }) => {
    return (
        <h2
            className={cn(
                "text-xl font-bold text-slate-900 leading-tight tracking-tight",
                className
            )}
            {...props}
        >
            {children}
        </h2>
    );
};

export const DialogDescription = ({ children, className, ...props }) => {
    return (
        <p
            className={cn(
                "text-sm text-slate-600 mt-2",
                className
            )}
            {...props}
        >
            {children}
        </p>
    );
};