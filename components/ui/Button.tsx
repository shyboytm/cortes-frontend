import React, { forwardRef, ButtonHTMLAttributes } from "react";

export default function Button({ children, variant = "primary", onClick }) {
  const styles = "px-4 py-2 rounded-md font-medium transition-all";
  const variants = {
    primary: "bg-purple-900 text-white hover:bg-purple-800",
    secondary: "bg-mauve-800 text-white hover:bg-mauve-700",
    tertiary: "bg-red-500 text-white hover:bg-red-600",
  };

  return (
    <button onClick={onClick} className={`${styles} ${variants[variant]}`}>
      {children}
    </button>
  );
}