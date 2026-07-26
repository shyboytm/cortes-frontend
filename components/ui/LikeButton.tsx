"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { play } from "cuelume";
import { cn } from "@/lib/utils";

export interface LikeButtonProps {
  id: string;
  initialLikes: number;
  variant?: "inline" | "corner" | "minimal" | "toolbar";
  className?: string;
}

const STORAGE_PREFIX = "liked:";

export default function LikeButton({ id, initialLikes, variant = "inline", className }: LikeButtonProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(false);
  const [pending, setPending] = useState(false);
  const [justLiked, setJustLiked] = useState(false);

  useEffect(() => {
    setLiked(window.localStorage.getItem(STORAGE_PREFIX + id) === "1");
  }, [id]);

  const handleToggle = async () => {
    if (pending) return;
    const nextLiked = !liked;

    setPending(true);
    setLiked(nextLiked);
    setLikes((n) => Math.max(0, n + (nextLiked ? 1 : -1)));
    if (nextLiked) {
      setJustLiked(true);
      window.setTimeout(() => setJustLiked(false), 300);
      window.localStorage.setItem(STORAGE_PREFIX + id, "1");
      play("success");
    } else {
      window.localStorage.removeItem(STORAGE_PREFIX + id);
      play("release");
    }

    try {
      const res = await fetch("/api/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: nextLiked ? "like" : "unlike" }),
      });
      const data = (await res.json().catch(() => ({}))) as { likes?: number; error?: string };
      if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
      if (typeof data.likes === "number") setLikes(data.likes);
    } catch (error) {
      console.error("Like failed to save:", error);
      setLiked(!nextLiked);
      setLikes((n) => Math.max(0, n + (nextLiked ? -1 : 1)));
      if (nextLiked) {
        window.localStorage.removeItem(STORAGE_PREFIX + id);
      } else {
        window.localStorage.setItem(STORAGE_PREFIX + id, "1");
      }
    } finally {
      setPending(false);
    }
  };

  const label = liked ? `Unlike (${likes} likes so far)` : `Like this post (${likes} likes so far)`;

  const onClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    handleToggle();
  };

  if (variant === "corner") {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={label}
        data-cuelume-hover="tick"
        className={cn(
          "absolute top-3 right-3 z-10 flex cursor-pointer items-center gap-1.5 rounded-full border border-black/20 bg-white/80 px-3 py-1.5 text-xs text-black backdrop-blur-sm transition-all duration-200 hover:bg-white/95 dark:border-white/20 dark:bg-black/70 dark:text-white dark:hover:bg-black/85 lg:opacity-0 lg:group-hover:opacity-100",
          justLiked && "scale-110",
          className
        )}
      >
        <Heart size={13} className={cn("transition-transform", liked && "fill-current text-red-500")} />
        {likes > 0 && <span className="tabular-nums">{likes}</span>}
      </button>
    );
  }

  if (variant === "toolbar") {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={label}
        data-cuelume-hover="tick"
        className={cn(
          "flex h-10 cursor-pointer items-center gap-1.5 rounded-full border border-black/20 bg-white/80 px-3 text-black/70 backdrop-blur-sm transition-colors hover:text-black dark:border-white/20 dark:bg-black/70 dark:text-white/70 dark:hover:text-white",
          justLiked && "scale-110",
          className
        )}
      >
        <Heart size={16} className={cn("shrink-0 transition-transform", liked && "fill-current text-red-500")} />
        {likes > 0 && <span className="text-sm tabular-nums">{likes}</span>}
      </button>
    );
  }

  if (variant === "minimal") {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={label}
        data-cuelume-hover="tick"
        className={cn(
          "inline-flex shrink-0 cursor-pointer items-center gap-1.5 text-xs text-black/60 transition-colors hover:text-black dark:text-white/60 dark:hover:text-white",
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
      aria-label={label}
      data-cuelume-hover="tick"
      className={cn(
        "inline-flex cursor-pointer items-center gap-2 rounded-full border border-black/10 bg-black/[0.03] px-4 py-2 text-xs tracking-widest text-black/70 uppercase transition-colors hover:bg-black/[0.06] hover:text-black dark:border-white/10 dark:bg-white/[0.03] dark:text-white/70 dark:hover:bg-white/[0.06] dark:hover:text-white",
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
