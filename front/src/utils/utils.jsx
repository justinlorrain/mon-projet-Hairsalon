import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

export const Card = ({ children, className }) => {
    return (
        <div
            className={`rounded-lg border bg-white border-slate-200 shadow-sm ${className}`}
        >
            {children}
        </div>
    );
};

export const CardHeader = ({ children }) => {
    return <div className="p-6 pb-2">{children}</div>;
};


export const CardTitle = ({ children }) => {
    return <h3 className="text-lg font-semibold">{children}</h3>;
};

export const CardDescription = ({ children }) => {
    return (
        <p className="mt-1 text-sm text-slate-500">
            {children}
        </p>
    );
};

export const CardContent = ({ children }) => {
    return <div className="p-6 pt-2">{children}</div>;
};


export const Avatar = ({ children, className = "" }) => {
    return (
        <div
            className={`relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full ${className}`}
        >
            {children}
        </div>
    );
};

export const AvatarFallback = ({ children, className = "" }) => {
    return (
        <div
            className={`flex h-full w-full items-center justify-center rounded-full ${className}`}
        >
            {children}
        </div>
    );
};

export const CardFooter = ({ children }) => {
    return <div className="p-6 pt-0">{children}</div>;
};
