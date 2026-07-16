"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import LikeButton from "@/components/ui/LikeButton";
import { cn } from "@/lib/utils";

export interface BlogStickyBarProps {
  id: string;
  title: string;
  likes?: number;
}

// Mirrors the Back/Like row that sits above the post title, but pinned just
// under PrimaryNav once that title scrolls out of view — so both stay
// reachable while reading a long post instead of scrolling away with the
// rest of the header. Driven by an IntersectionObserver watching a sentinel
// element the post page renders right after its title, rather than a
// scroll-position threshold, so it stays correct regardless of how tall the
// title/subtitle end up being.
export default function BlogStickyBar({ id, title, likes }: BlogStickyBarProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const sentinel = document.getElementById("post-title-sentinel");
    if (!sentinel) return;

    const observer = new IntersectionObserver(([entry]) => setVisible(!entry.isIntersecting));
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      aria-hidden={!visible}
      className={cn(
        // Hidden below sm — same reasoning as StickySubNav: not enough
        // vertical room right under PrimaryNav on phones for a second bar.
        //
        // top-[92px] at every breakpoint, same as StickySubNav: PrimaryNav
        // is now just Logo + hamburger everywhere, so its height no longer
        // shrinks at lg the way it did when a text-link row lived there.
        "dot-font glass fixed inset-x-0 top-[92px] z-40 hidden px-3 transition-all duration-200 ease-out sm:block md:px-4 lg:px-6",
        visible ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-4 opacity-0"
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 rounded-lg border border-black/10 bg-white/80 px-6 py-3 font-doto dark:border-white/10 dark:bg-black/80">
        <div className="flex min-w-0 items-center gap-4">
          <Link href="/writing" className={cn(buttonVariants({ variant: "secondary", size: "sm" }), "font-sans")}>
            <ArrowLeft size={18} /> <span className="inline-block translate-y-[1px]">Back</span>
          </Link>
          <p className="truncate text-sm tracking-wide text-black dark:text-white">{title}</p>
        </div>

        <LikeButton id={id} initialLikes={likes ?? 0} className="font-sans" />
      </div>
    </div>
  );
}
