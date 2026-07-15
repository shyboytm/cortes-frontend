"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

export interface LikeButtonProps {
  id: string;
  initialLikes: number;
  // "inline" — a standalone bordered pill, used on the blog post detail
  // page. "corner" — a badge pinned to the top-right of a card, used on
  // Feed grid items (always visible on touch/tablet, hover-revealed on
  // desktop). "minimal" — a bare heart + count with no chrome, used inline
  // in list rows (Recs, the Blog index) that already have their own
  // hover/arrow affordance.
  variant?: "inline" | "corner" | "minimal";
  className?: string;
}

const STORAGE_PREFIX = "liked:";

// A simple, honest like counter: one like per browser (tracked in
// localStorage, not a real account system), incrementing a single shared
// `likes` count stored on the Sanity document itself so the number
// persists and reads the same for every visitor. Optimistic on click —
// bumps the displayed count immediately and rolls back if the request
// to /api/like fails.
export default function LikeButton({ id, initialLikes, variant = "inline", className }: LikeButtonProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(false);
  const [pending, setPending] = useState(false);
  const [justLiked, setJustLiked] = useState(false);

  // Read localStorage only after mount — it isn't available during SSR and
  // reading it during render would mismatch the server-rendered markup.
  useEffect(() => {
    setLiked(window.localStorage.getItem(STORAGE_PREFIX + id) === "1");
  }, [id]);

  const handleClick = async () => {
    if (liked || pending) return;
    setPending(true);
    setLiked(true);
    setLikes((n) => n + 1);
    setJustLiked(true);
    window.localStorage.setItem(STORAGE_PREFIX + id, "1");
    window.setTimeout(() => setJustLiked(false), 300);

    try {
      const res = await fetch("/api/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = (await res.json().catch(() => ({}))) as { likes?: number; error?: string };
      if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
      if (typeof data.likes === "number") setLikes(data.likes);
    } catch (error) {
      // The like didn't actually save server-side — undo the optimistic
      // update so the count/localStorage stay honest. Logged (not silent)
      // so the real reason shows up in the browser console instead of just
      // looking like the count silently reset itself.
      console.error("Like failed to save:", error);
      setLiked(false);
      setLikes((n) => Math.max(0, n - 1));
      window.localStorage.removeItem(STORAGE_PREFIX + id);
    } finally {
      setPending(false);
    }
  };

  const label = liked ? `${likes} likes — you liked this` : `Like this post (${likes} likes so far)`;

  // Rows/cards using "corner" or "minimal" are usually themselves wrapped
  // in a Link (a whole row/card is clickable) — stopping propagation here
  // keeps a like tap from also triggering that navigation. Harmless for
  // "inline", which never sits inside a Link.
  const onClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    handleClick();
  };

  if (variant === "corner") {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={liked || pending}
        aria-label={label}
        className={cn(
          "absolute top-3 right-3 z-10 flex cursor-pointer items-center gap-1.5 rounded-full bg-black/70 px-3 py-1.5 text-xs text-white backdrop-blur-sm transition-all duration-200 disabled:cursor-not-allowed dark:bg-white/80 dark:text-black lg:opacity-0 lg:group-hover:opacity-100",
          liked && "lg:opacity-100",
          justLiked && "scale-110",
          className
        )}
      >
        <Heart size={13} className={cn("transition-transform", liked && "fill-current text-red-500")} />
        {likes > 0 && <span className="tabular-nums">{likes}</span>}
      </button>
    );
  }

  if (variant === "minimal") {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={liked || pending}
        aria-label={label}
        className={cn(
          "inline-flex shrink-0 cursor-pointer items-center gap-1.5 text-xs text-black/40 transition-colors hover:text-black disabled:cursor-not-allowed dark:text-white/40 dark:hover:text-white",
          liked && "text-red-800 hover:text-red-800 dark:text-red-400 dark:hover:text-red-400",
          className
        )}
      >
        <Heart
          size={13}
          className={cn("shrink-0 transition-transform", liked && "fill-current", justLiked && "scale-125")}
        />
        <span className="tabular-nums">{likes}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={liked || pending}
      aria-label={label}
      className={cn(
        "inline-flex cursor-pointer items-center gap-2 rounded-full border border-black/10 bg-black/[0.03] px-4 py-2 text-xs tracking-widest text-black/70 uppercase transition-colors hover:bg-black/[0.06] hover:text-black disabled:cursor-not-allowed dark:border-white/10 dark:bg-white/[0.03] dark:text-white/70 dark:hover:bg-white/[0.06] dark:hover:text-white",
        liked && "border-red-800/30 text-red-800 hover:bg-red-800/10 hover:text-red-800 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-500/10 dark:hover:text-red-400",
        className
      )}
    >
      <Heart
        size={14}
        className={cn("shrink-0 transition-transform", liked && "fill-current", justLiked && "scale-125")}
      />
      <span className="tabular-nums">{likes}</span>
    </button>
  );
}
