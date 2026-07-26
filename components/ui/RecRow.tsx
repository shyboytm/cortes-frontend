import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
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

const IMAGE_VARIANT_STYLES: Record<NonNullable<RecRowProps["imageVariant"]>, { containerClassName: string; imageSizes: string }> = {
  default: { containerClassName: "h-12 w-12 rounded-xl border-black/10 dark:border-white/10", imageSizes: "48px" },
  cd: {
    containerClassName:
      "h-12 w-12 rounded-[2px] border-black/15 shadow-[1px_2px_5px_rgba(0,0,0,0.35)] dark:border-white/20",
    imageSizes: "48px",
  },
  book: {
    containerClassName: "h-16 w-11 rounded-l-md rounded-r-xs border-black/10 shadow-md dark:border-white/10",
    imageSizes: "44px",
  },
};

export interface RecRowProps {
  id: string;
  title: string;
  description?: string;
  url?: string;
  imageUrl?: string;
  imageAlt?: string;
  platform?: Platform;
  likes?: number;
  hoverPreviewUrl?: string;
  hoverPreviewAlt?: string;
  imageVariant?: "default" | "cd" | "book";
}

export default function RecRow({
  id,
  title,
  description,
  url,
  imageUrl,
  imageAlt,
  platform,
  likes,
  imageVariant = "default",
  hoverPreviewUrl,
  hoverPreviewAlt,
}: RecRowProps) {
  if (!url) return null;

  const isCd = imageVariant === "cd";
  const variantStyles = IMAGE_VARIANT_STYLES[imageVariant];

  let hostname: string | null = null;
  try {
    hostname = new URL(url).hostname.replace(/^www\./, "");
  } catch {
    hostname = null;
  }

  return (
    <li className="border-b border-black/10 last:border-b-0 md:[&:nth-last-child(2)]:border-b-0 dark:border-white/10">
      <Link
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        data-cuelume-hover="tick"
        data-cuelume-press
        className="group relative -mx-3 flex items-start gap-4 rounded-md px-4 py-4 transition-colors hover:bg-black/[0.03] dark:hover:bg-white/[0.03]"
      >
        {hoverPreviewUrl && (
          <div
            aria-hidden
            className="pointer-events-none absolute bottom-full left-4 z-30 mb-2 w-72 origin-bottom-left scale-95 overflow-hidden rounded-lg border border-black/10 bg-white opacity-0 shadow-xl transition-all duration-150 group-hover:scale-100 group-hover:opacity-100 sm:w-80 dark:border-white/10 dark:bg-black"
          >
            <div className="flex items-center gap-1.5 border-b border-black/10 bg-black/5 px-3 py-2 dark:border-white/10 dark:bg-white/5">
              <span className="h-2 w-2 rounded-full bg-red-400/70" />
              <span className="h-2 w-2 rounded-full bg-yellow-400/70" />
              <span className="h-2 w-2 rounded-full bg-green-400/70" />
              {hostname && (
                <span className="ml-2 font-doto truncate rounded-sm bg-black/5 px-2 py-0.5 text-xs font-bold text-black/60 dark:bg-white/10 dark:text-white/60">
                  {hostname}
                </span>
              )}
            </div>
            <div className="relative aspect-[16/10] w-full bg-black/5 dark:bg-white/5">
              <Image src={hoverPreviewUrl} alt={hoverPreviewAlt || ""} fill className="object-cover object-top" sizes="320px" />
            </div>
          </div>
        )}

        {imageUrl && (
          <div
            className={cn(
              "relative shrink-0 overflow-hidden border bg-black/5 dark:bg-white/5",
              variantStyles.containerClassName
            )}
          >
            <Image
              src={imageUrl}
              alt={imageAlt || title}
              fill
              className="object-cover"
              sizes={variantStyles.imageSizes}
            />
            {isCd && (
              <>
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-white/0 via-white/50 to-white/0 opacity-40 mix-blend-overlay" />
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
              <span className="rounded-full border border-black/10 px-2 py-0.5 text-[10px] tracking-widest text-black/60 uppercase dark:border-white/10 dark:text-white/60">
                {PLATFORM_LABELS[platform]}
              </span>
            )}
            <LikeButton id={id} initialLikes={likes ?? 0} variant="minimal" />
            <ArrowUpRight
              size={16}
              className="-translate-x-1 text-black/60 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100 dark:text-white/60"
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
