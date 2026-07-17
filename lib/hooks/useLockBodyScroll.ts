"use client";

import { useEffect } from "react";

// Locks background scroll while `locked` is true (a fullscreen menu or
// lightbox is open). Setting `overflow: hidden` alone makes the scrollbar
// disappear, which widens the viewport by the scrollbar's width and shifts
// every fixed/centered element on the page sideways for as long as the lock
// is active. That's fixed in globals.scss (`html { scrollbar-gutter: stable
// }`), which reserves the scrollbar's space permanently so it never actually
// disappears — so this hook doesn't need to (and must not) compensate with
// its own padding-right. An earlier version of this hook did add matching
// padding, computed from `window.innerWidth - document.documentElement.
// clientWidth`; once the gutter was made permanent that difference stopped
// being "the scrollbar width that's about to disappear" and became just
// "the gutter's constant width", so the padding was being added for real
// (asymmetrically, only while locked) and was itself shifting content left
// every time the menu opened.
export function useLockBodyScroll(locked: boolean) {
  useEffect(() => {
    if (!locked) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [locked]);
}
