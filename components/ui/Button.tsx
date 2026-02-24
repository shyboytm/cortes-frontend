import React, { forwardRef, ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  variant?: "primary" | "secondary" | "tertiary";
}

export default function Button({ children, variant = "primary" }: ButtonProps) {
  const styles = "font-semibold px-4 py-2 rounded-xl transition-all";
  const variants = {
    primary: "bg-purple-900 text-white hover:bg-purple-800",
    secondary: "bg-mauve-800 text-white hover:bg-mauve-700",
    tertiary: "bg-transparent text-white/75 hover:bg-mauve-900 hover:text-white",
  };

  return (
    <button className={`${styles} ${variants[variant]}`}>
      {children}
    </button>
  );
}