"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import LikeButton from "@/components/ui/LikeButton";
import ShareButtons from "@/components/ui/ShareButtons";
import { useSentinelVisible } from "@/lib/hooks/useSentinelVisible";
import { cn } from "@/lib/utils";

export interface DetailStickyBarProps {
  id: string;
  title: string;
  likes?: number;
  backHref: string;
  // Id of the sentinel element the page renders right after its title.
  // Watched via IntersectionObserver to know when to reveal this bar.
  sentinelId: string;
  // Renders a ShareButtons row next to the like count when set. Opt-in
  // (only Writing posts pass these) rather than shown on every caller of
  // this shared bar, since Work case studies weren't asked for sharing.
  shareUrl?: string;
  shareTitle?: string;
}

// Shows a Back/Like row pinned under PrimaryNav once a detail page's title
// scrolls out of view. Visibility is driven by an IntersectionObserver
// watching a sentinel element the page renders right after its title. Used
// by both Writing posts and Work case studies. Padding matches PrimaryNav's
// own bar exactly (px-5 py-3) so the two feel like the same bar handing off.
export default function DetailStickyBar({
  id,
  title,
  likes,
  backHref,
  sentinelId,
  shareUrl,
  shareTitle,
}: DetailStickyBarProps) {
  const visible = useSentinelVisible(sentinelId);

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
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 rounded-lg border border-black/10 bg-white/80 px-5 py-3 font-doto dark:border-white/10 dark:bg-black/80">
        <div className="flex min-w-0 items-center gap-4">
          <Link
            href={backHref}
            className={cn(buttonVariants({ variant: "secondary", size: "sm" }), "font-sans")}
            data-cuelume-hover="tick"
            data-cuelume-press
          >
            <ArrowLeft size={18} /> Back
          </Link>
          <p className="truncate text-sm tracking-wide text-black dark:text-white">{title}</p>
        </div>

        <div className="flex shrink-0 items-center gap-7">
          {shareUrl && <ShareButtons url={shareUrl} title={shareTitle ?? title} className="hidden md:flex" />}
          <LikeButton id={id} initialLikes={likes ?? 0} className="font-sans" />
        </div>
      </div>
    </div>
  );
}
