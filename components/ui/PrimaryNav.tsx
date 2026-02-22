import React, { forwardRef, ButtonHTMLAttributes } from "react";

export default function Button({ children, variant = "primary", onClick }) {
  const styles = "font-semibold mb-16 px-4 py-2 rounded-xl transition-all";

  const itemStyles = "opacity-75 hover:opacity-100 transition-opacity cursor-pointer ";

  return (
    <div onClick={onClick} className={`${styles}`}>
      <ul>
        <li className={`${itemStyles}`}>Home</li>
        <li className={`${itemStyles}`}>Blog</li>
      </ul>
    </div>
  );
}