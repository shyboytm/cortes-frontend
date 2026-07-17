"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import LikeButton from "@/components/ui/LikeButton";
import { useSentinelVisible } from "@/lib/hooks/useSentinelVisible";
import { cn } from "@/lib/utils";

export interface BlogStickyBarProps {
  id: string;
  title: string;
  likes?: number;
}

// Shows a Back/Like row pinned under PrimaryNav once the post title scrolls
// out of view. Visibility is driven by an IntersectionObserver watching a
// sentinel element the post page renders right after its title.
export default function BlogStickyBar({ id, title, likes }: BlogStickyBarProps) {
  const visible = useSentinelVisible("post-title-sentinel");

  return (
    <div
      aria-hidden={!visible}
      className={cn(
        // Hidden below sm: not enough vertical room right under PrimaryNav
        // on phones for a second bar. top-[92px] at every breakpoint since
        // PrimaryNav's height is the same at every breakpoint.
        "dot-font glass fixed inset-x-0 top-[92px] z-40 hidden px-3 transition-all duration-200 ease-out sm:block md:px-4 lg:px-6",
        visible ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-4 opacity-0"
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 rounded-lg border border-black/10 bg-white/80 px-6 py-3 font-doto dark:border-white/10 dark:bg-black/80">
        <div className="flex min-w-0 items-center gap-4">
          <Link href="/writing" className={cn(buttonVariants({ variant: "secondary", size: "sm" }), "font-sans")}>
            <ArrowLeft size={18} /> Back
          </Link>
          <p className="truncate text-sm tracking-wide text-black dark:text-white">{title}</p>
        </div>

        <LikeButton id={id} initialLikes={likes ?? 0} className="font-sans" />
      </div>
    </div>
  );
}
