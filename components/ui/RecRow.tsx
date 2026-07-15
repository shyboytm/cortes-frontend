import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Disc3 } from "lucide-react";
import { cn } from "@/lib/utils";
import LikeButton from "@/components/ui/LikeButton";

export type Platform = "ios" | "ipad" | "mac" | "android" | "web" | "all";

const PLATFORM_LABELS: Record<Platform, string> = {
  ios: "iOS",
  ipad: "iPad",
  mac: "Mac",
  android: "Android",
  web: "Web",
  all: "All Platforms",
};

export interface RecRowProps {
  id: string;
  title: string;
  description?: string;
  url?: string;
  imageUrl?: string;
  // A larger version of imageUrl, used only in the hover preview card below
  // (the inline thumbnail stays small/cropped for the list row itself).
  previewImageUrl?: string;
  imageAlt?: string;
  platform?: Platform;
  likes?: number;
  // "cd" gives the thumbnail a jewel-case look (square corners, a glossy
  // diagonal sheen, and a spine line) — used for the Music section on Recs.
  imageVariant?: "default" | "cd";
}

// One recommendation's row: optional thumbnail, name (external link), and
// the "why I recommend this" blurb underneath — same hover-tint + sliding
// arrow affordance PostRow uses, just pointed off-site instead of to a
// detail page. Renders nothing without a link since there's nowhere for it
// to go. `platform` renders a small tag (only apps set this). Hovering
// reveals a small preview card (bigger image + link target) above the row.
export default function RecRow({
  id,
  title,
  description,
  url,
  imageUrl,
  previewImageUrl,
  imageAlt,
  platform,
  likes,
  imageVariant = "default",
}: RecRowProps) {
  if (!url) return null;

  const isCd = imageVariant === "cd";

  let hostname: string | null = null;
  try {
    hostname = new URL(url).hostname.replace(/^www\./, "");
  } catch {
    hostname = null;
  }

  return (
    <li className="border-b border-black/10 dark:border-white/10">
      <Link
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative -mx-3 flex items-start gap-4 rounded-md px-4 py-4 transition-colors hover:bg-black/[0.03] dark:hover:bg-white/[0.03]"
      >
        {/* Hover preview — a bigger version of the thumbnail plus the link
            target, like a rich link-unfurl card. Pure CSS (no JS): hidden
            until the row is hovered, and never intercepts clicks itself. */}
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-full left-4 z-30 mb-2 w-56 origin-bottom-left scale-95 rounded-lg border border-black/10 bg-white p-3 opacity-0 shadow-xl transition-all duration-150 group-hover:scale-100 group-hover:opacity-100 dark:border-white/10 dark:bg-black"
        >
          <div className="flex items-center gap-3">
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md border border-black/10 bg-black/5 dark:border-white/10 dark:bg-white/5">
              {previewImageUrl || imageUrl ? (
                <Image
                  src={previewImageUrl || imageUrl!}
                  alt={imageAlt || title}
                  fill
                  className="object-cover"
                  sizes="56px"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-black/20 dark:text-white/20">
                  <Disc3 size={20} />
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-normal text-black dark:text-white">{title}</p>
              {hostname && (
                <p className="dot-font mt-1 truncate font-doto text-[10px] tracking-widest text-black/40 uppercase dark:text-white/40">
                  {hostname}
                </p>
              )}
            </div>
          </div>
        </div>

        {imageUrl && (
          <div
            className={cn(
              "relative h-12 w-12 shrink-0 overflow-hidden border bg-black/5 dark:bg-white/5",
              isCd
                ? "rounded-[2px] border-black/15 shadow-[1px_2px_5px_rgba(0,0,0,0.35)] dark:border-white/20"
                : "rounded-xl border-black/10 dark:border-white/10"
            )}
          >
            <Image src={imageUrl} alt={imageAlt || title} fill className="object-cover" sizes="48px" />
            {isCd && (
              <>
                {/* Plastic-case gloss — a soft diagonal highlight across the
                    artwork, like light catching a jewel case's cover. */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-white/0 via-white/50 to-white/0 opacity-40 mix-blend-overlay" />
                {/* Black plastic spine along the left edge, like a jewel
                    case's hinge — solid in both themes since real CD spines
                    are always opaque black regardless of the artwork. */}
                <div className="pointer-events-none absolute inset-y-0 left-0 w-[3px] bg-black" />
                <div className="pointer-events-none absolute inset-y-0 left-[3px] w-px bg-white/10" />
              </>
            )}
          </div>
        )}

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-normal tracking-wide text-black dark:text-white">{title}</h3>
            {platform && (
              <span className="rounded-full border border-black/10 px-2 py-0.5 text-[10px] tracking-widest text-black/50 uppercase dark:border-white/10 dark:text-white/50">
                <span className="inline-block translate-y-[1px]">{PLATFORM_LABELS[platform]}</span>
              </span>
            )}
            <LikeButton id={id} initialLikes={likes ?? 0} variant="minimal" />
            <ArrowUpRight
              size={16}
              className="-translate-x-1 text-black/40 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100 dark:text-white/40"
            />
          </div>
          {description && (
            <p className="mt-1 text-sm text-black/60 dark:text-white/60">{description}</p>
          )}
        </div>
      </Link>
    </li>
  );
}
