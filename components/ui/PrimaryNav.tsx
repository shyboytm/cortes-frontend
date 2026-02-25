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
  const styles = "fixed flex font-semibold glow justify-between top-8 w-full z-40";

  const itemStyles = "opacity-75 hover:opacity-100 transition-opacity cursor-pointer";

  return (
    <div className={`${styles}`}>
      <ul className="bg-black/10 dark:bg-white/10 flex glass items-center gap-6 px-6 py-2 rounded-full transition-all ">
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
      <ul className="bg-black/10 dark:bg-white/10 flex glass items-center gap-6 px-6 py-2 rounded-full transition-all ">
        <li className={`font-mono font-normal`}>
          {dateTime}
        </li>
      </ul>
    </div>
  );
}