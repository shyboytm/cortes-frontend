"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

// Scroll distance in px after which the button becomes visible.
const SHOW_AFTER_PX = 480;

// Mounted once in the root layout. Fixed positioning keeps it tracking the
// viewport regardless of the current page's scroll position.
export default function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > SHOW_AFTER_PX);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Back to top"
      tabIndex={visible ? 0 : -1}
      data-cuelume-hover="tick"
      data-cuelume-press
      className={cn(
        "fixed right-6 bottom-6 z-40 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-black/10 bg-white/80 text-black shadow-lg backdrop-blur-sm transition-all duration-200 hover:border-black/20 hover:bg-white sm:right-8 sm:bottom-8 dark:border-white/10 dark:bg-black/80 dark:text-white dark:hover:border-white/20 dark:hover:bg-black",
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
      )}
    >
      <ArrowUp size={18} />
    </button>
  );
}
