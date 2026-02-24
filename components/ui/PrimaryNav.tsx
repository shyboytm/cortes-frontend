import React from "react";
import Link from 'next/link'

export default function PrimaryNav({}) {
  const styles = "glass bg-black/10 dark:bg-white/10 fixed font-semibold px-6 py-2 rounded-full transition-all top-8 z-40";

  const itemStyles = "opacity-75 hover:opacity-100 transition-opacity cursor-pointer";

  return (
    <div className={`${styles}`}>
      <ul className="flex items-start gap-6">
        <li className={`${itemStyles}`}>
          <Link href="/">Home</Link>
        </li>
        <li className={`${itemStyles}`}>
          <Link href="/blog">Blog</Link>
        </li>
        <li className={`${itemStyles}`}>
          <Link href="/about">About</Link>
        </li>
        <li className={`${itemStyles}`}>
          <Link href="/work">Work</Link>
        </li>
      </ul>
    </div>
  );
}