import React, { forwardRef, ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "primary" | "secondary";
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ children, className = "", variant = "primary", type = "button", ...props }, ref) => {
        const base = "px-4 py-2 rounded focus:outline-none focus:ring";
        const variants =
            variant === "primary"
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300";

        return (
            <button ref={ref} type={type} className={`${base} ${variants} ${className}`} {...props}>
                {children}
            </button>
        );
    }
);

export default Button;