import React, { forwardRef, ButtonHTMLAttributes } from "react";

export default function Button({ children, variant = "primary", onClick }) {
  const styles = "font-semibold pt-4 mb-16 transition-all";

  const itemStyles = "opacity-75 hover:opacity-100 transition-opacity cursor-pointer";

  return (
    <div onClick={onClick} className={`${styles}`}>
      <ul className="flex items-start gap-6">
        <li className={`${itemStyles}`}>Home</li>
        <li className={`${itemStyles}`}>Blog</li>
      </ul>
    </div>
  );
}