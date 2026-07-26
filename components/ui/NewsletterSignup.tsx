"use client";

import { useState, type FormEvent } from "react";
import { play } from "cuelume";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

type Status = "idle" | "loading" | "success" | "error";

export interface NewsletterSignupProps {
  className?: string;
}

export default function NewsletterSignup({ className }: NewsletterSignupProps) {
  const [email, setEmail] = useState("");
  const [confirmedHuman, setConfirmedHuman] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (status === "loading" || !confirmedHuman) return;

    setStatus("loading");
    setErrorMessage(null);

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, confirmedHuman }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setStatus("error");
        setErrorMessage(data?.error || "Something went wrong, try again");
        return;
      }

      setStatus("success");
      setEmail("");
      play("success");
    } catch {
      setStatus("error");
      setErrorMessage("Something went wrong, try again");
    }
  };

  if (status === "success") {
    return (
      <div className={cn("flex flex-col gap-2", className)}>
        <p className="dot-font font-doto text-xs tracking-widest text-black/60 uppercase dark:text-white/60">
          / Newsletter
        </p>
        <p className="text-sm text-black/70 dark:text-white/70">
          You&apos;re on the list, thanks for signing up!
        </p>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <p className="dot-font font-doto text-xs tracking-widest text-black/60 uppercase dark:text-white/60">
        / Newsletter
      </p>
      <p className="text-sm text-black/60 dark:text-white/60">Occasional work and music updates, no spam.</p>

      <form onSubmit={handleSubmit} className="mt-1 flex w-full flex-col gap-2 sm:max-w-[380px]">
        <div className="relative w-full">
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@email.com"
            aria-label="Email address"
            className="w-full min-w-0 rounded-md border border-black/10 dark:bg-black/50 py-4 px-4 text-sm text-black placeholder:text-black/40 transition-colors outline-none focus:border-black/30 dark:border-white/10 bg-white/50 dark:text-white dark:placeholder:text-white/40 dark:focus:border-white/30"
          />
          <button
            type="submit"
            disabled={status === "loading" || !confirmedHuman}
            data-cuelume-hover="tick"
            data-cuelume-press
            className={cn(
              buttonVariants({ variant: "secondary", size: "sm" }),
              "absolute top-1/2 right-3 -translate-y-1/2 disabled:cursor-not-allowed disabled:opacity-60"
            )}
          >
            {status === "loading" ? "..." : "Subscribe"}
          </button>
        </div>

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
      </form>

      {status === "error" && errorMessage && (
        <p className="text-xs text-red-800 dark:text-red-500">{errorMessage}</p>
      )}
    </div>
  );
}
