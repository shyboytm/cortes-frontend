"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import PrimaryNav from "@/components/ui/PrimaryNav";
import PageHeader from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";

export default function WorkPasswordGate({ slug, title }: { slug: string; title: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/work-unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, password }),
      });

      if (!response.ok) {
        setError("That password isn't right.");
        return;
      }

      router.refresh();
    } catch {
      setError("Something went wrong, try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-32 pb-24">
      <PrimaryNav />
      <div className="m-auto w-full max-w-7xl px-6 md:px-10">
        <PageHeader title={title} subtitle="This case study is still coming together." />

        <form onSubmit={handleSubmit} className="mt-4 flex max-w-sm flex-col gap-4">
          <label
            htmlFor="work-preview-password"
            className="flex items-center gap-2 text-sm text-black/60 dark:text-white/60"
          >
            <Lock size={16} className="shrink-0" />
            Enter the preview password to view it early
          </label>
          <input
            id="work-preview-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoFocus
            className="rounded-sm border border-black/20 bg-transparent px-4 py-2 text-base text-black outline-none focus:border-black dark:border-white/20 dark:text-white dark:focus:border-white"
          />
          {error && <p className="text-sm text-red-500 dark:text-red-400">{error}</p>}
          <Button type="submit" disabled={isSubmitting || !password} className="w-fit">
            {isSubmitting ? "Checking…" : "Unlock"}
          </Button>
        </form>
      </div>
    </div>
  );
}
