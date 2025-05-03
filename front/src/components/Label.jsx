import React from 'react';
import { cn } from '../utils/utils';


export const Label = React.forwardRef(({
    className,
    children,
    htmlFor,
    variant = 'default',
    ...props
}, ref) => {
    const variants = {
        default: 'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
        subtle: 'text-sm text-muted-foreground',
        error: 'text-sm font-medium text-destructive',
    };

    return (
        <label
            ref={ref}
            htmlFor={htmlFor}
            className={cn(
                variants[variant],
                className
            )}
            {...props}
        >
            {children}
        </label>
    );
});

Label.displayName = 'Label';