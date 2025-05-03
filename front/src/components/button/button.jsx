export const Button = ({
    children,
    variant = "default",
    className = "",
    onClick,
    disabled = false,
    ...props
}) => {
    let variantClasses = "";

    if (variant === "default") {
        variantClasses = disabled
            ? "bg-slate-400 text-white cursor-not-allowed"
            : "bg-slate-900 text-white hover:bg-slate-800";
    } else if (variant === "outline") {
        variantClasses = disabled
            ? "border border-slate-300 text-slate-400 cursor-not-allowed"
            : "border border-slate-200 hover:bg-slate-100";
    } else if (variant === "ghost") {
        variantClasses = disabled
            ? "text-slate-400 cursor-not-allowed"
            : "hover:bg-slate-100";
    }

    return (
        <button
            className={`inline-flex hover:cursor-pointer items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${variantClasses} ${className}`}
            onClick={onClick}
            disabled={disabled}
            {...props}
        >
            {children}
        </button>
    );
};
