import React from "react";
import Link from 'next/link'

let dateTime = new Date().toLocaleString("en-US", {
  timeZone: "America/Chicago",
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "numeric",
  hour12: true,
});

export default function PrimaryNav({}) {
  const styles = "bg-white/10 dark:bg-white/10 flex glass fixed font-semibold glow justify-between px-6 rounded-full top-8 w-full z-40";
  const itemStyles = "opacity-75 hover:opacity-100 transition-opacity cursor-pointer";
  const ulStyles = "flex items-center gap-6 px-6 py-1 transition-all";
  const ulStackedStyles = "flex flex-col gap-2 transition-all";

  return (
    <div className="px-6 w-full">
      <div className={`${styles}`}>
        <ul className={`${ulStackedStyles}`}>
          <li>
            Dennis Cortés
          </li>
          <li className={`font-mono opacity-50 text-xs w-full`}>
            DESIGN / PHOTO / CODE / MUSIC
          </li>
        </ul>
        <ul className={`${ulStackedStyles}`}>
          <li className={`font-mono opacity-50 text-xs w-full`}>
            36.1627° N, 86.7816° W
          </li>
          <li className={`font-mono opacity-50 text-xs w-full`}>
            {dateTime}
          </li>
        </ul>
        <ul className={`${ulStyles}`}>
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
    </div>
  );
}