"use client";

import { useState, type FormEvent } from "react";
import { play } from "cuelume";
import { cn, formatPostDate } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import type { CommentDoc } from "@/lib/comments";

type Status = "idle" | "loading" | "success" | "error";

export interface CommentSectionProps {
  parentId: string;
  initialComments: CommentDoc[];
  className?: string;
}

export default function CommentSection({ parentId, initialComments, className }: CommentSectionProps) {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [confirmedHuman, setConfirmedHuman] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (status === "loading" || !confirmedHuman) return;

    setStatus("loading");
    setErrorMessage(null);

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ parentId, name, message, confirmedHuman }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setStatus("error");
        setErrorMessage(data?.error || "Something went wrong, try again");
        return;
      }

      setStatus("success");
      setName("");
      setMessage("");
      setConfirmedHuman(false);
      play("success");
    } catch {
      setStatus("error");
      setErrorMessage("Something went wrong, try again");
    }
  };

  return (
    <div className={cn("mx-auto w-full max-w-3xl", className)}>
      <p className="dot-font font-doto text-xs tracking-widest text-black/60 uppercase dark:text-white/60">
        / Comments
      </p>

      {initialComments.length > 0 ? (
        <ul className="mt-4 mb-8 flex flex-col gap-4">
          {initialComments.map((comment) => (
            <li
              key={comment._id}
              className="rounded-sm border border-black/10 bg-black/[0.03] p-4 dark:border-white/10 dark:bg-white/[0.03]"
            >
              <div className="mb-1.5 flex items-baseline justify-between gap-3">
                <span className="text-sm font-medium text-black dark:text-white">{comment.name}</span>
                <span className="dot-font font-doto text-[10px] tracking-widest text-black/40 uppercase dark:text-white/40">
                  {formatPostDate(comment.createdAt)}
                </span>
              </div>
              <p className="text-sm leading-relaxed whitespace-pre-line text-black/80 dark:text-white/80">
                {comment.message}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 mb-8 text-sm text-black/60 dark:text-white/60">
          No comments yet, be the first to say something.
        </p>
      )}

      {status === "success" ? (
        <p className="text-sm text-black/70 dark:text-white/70">
          Thanks! Your comment is awaiting approval and will show up here once it&apos;s reviewed.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="text"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Your name"
            aria-label="Your name"
            maxLength={80}
            className="w-full min-w-0 rounded-md border border-black/10 bg-white/50 px-4 py-3 text-sm text-black placeholder:text-black/40 transition-colors outline-none focus:border-black/30 dark:border-white/10 dark:bg-black/50 dark:text-white dark:placeholder:text-white/40 dark:focus:border-white/30"
          />
          <textarea
            required
            rows={4}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Leave a comment"
            aria-label="Your comment"
            maxLength={2000}
            className="w-full min-w-0 resize-y rounded-md border border-black/10 bg-white/50 px-4 py-3 text-sm text-black placeholder:text-black/40 transition-colors outline-none focus:border-black/30 dark:border-white/10 dark:bg-black/50 dark:text-white dark:placeholder:text-white/40 dark:focus:border-white/30"
          />

          <label className="flex items-center gap-2 text-xs text-black/60 dark:text-white/60">
            <input
              type="checkbox"
              required
              checked={confirmedHuman}
              onChange={(event) => setConfirmedHuman(event.target.checked)}
              className="h-3.5 w-3.5 rounded-sm border border-black/20 accent-black dark:border-white/20 dark:accent-white"
            />
            I&apos;m not a robot
          </label>

          <button
            type="submit"
            disabled={status === "loading" || !confirmedHuman}
            data-cuelume-hover="tick"
            data-cuelume-press
            className={cn(
              buttonVariants({ variant: "secondary", size: "sm" }),
              "self-start disabled:cursor-not-allowed disabled:opacity-60"
            )}
          >
            {status === "loading" ? "..." : "Post Comment"}
          </button>

          {status === "error" && errorMessage && (
            <p className="text-xs text-red-800 dark:text-red-500">{errorMessage}</p>
          )}
        </form>
      )}
    </div>
  );
}
