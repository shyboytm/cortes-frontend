import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { SanityImageSource } from "@sanity/image-url";
import { urlFor } from "@/sanity/image";
import FeedVideo from "@/components/ui/FeedVideo";

export interface FeedItem {
  _id: string;
  caption?: string;
  link?: string;
  image?: {
    alt?: string;
    asset?: SanityImageSource;
    aspectRatio?: number | null;
  } | null;
  video?: {
    url?: string;
    mimeType?: string;
  } | null;
}

export interface FeedGridProps {
  items: FeedItem[];
}

// A CSS-only masonry grid — no JS packing library, just a multi-column
// layout where each item keeps its source image's native aspect ratio
// (via the aspectRatio GROQ projection) instead of being cropped to a
// uniform shape. Adding a portrait or landscape photo in Sanity just
// changes how tall that one tile is; nothing else needs to change. Video
// items don't carry aspect-ratio metadata the way images do, so they fall
// back to a standard 16:9 box.
export default function FeedGrid({ items }: FeedGridProps) {
  if (items.length === 0) {
    return (
      <p className="text-black/60 dark:text-white/60">Nothing in the feed yet — add an image or video in Sanity.</p>
    );
  }

  return (
    <div className="columns-1 gap-6 sm:columns-2 lg:columns-3">
      {items.map((item) => {
        const hasVideo = Boolean(item.video?.url);
        if (!hasVideo && !item.image?.asset) return null;

        const ratio = hasVideo
          ? 16 / 9
          : item.image?.aspectRatio && item.image.aspectRatio > 0
            ? item.image.aspectRatio
            : 4 / 3;
        const isClickable = Boolean(item.link);

        const media = (
          <div
            className="group relative w-full overflow-hidden rounded-sm border border-black/10 bg-black/5 dark:border-white/10 dark:bg-white/5"
            style={{ aspectRatio: ratio }}
          >
            {hasVideo ? (
              <FeedVideo url={item.video!.url!} mimeType={item.video?.mimeType} />
            ) : (
              item.image?.asset && (
                <Image
                  src={urlFor(item.image.asset).width(1200).fit("max").url()}
                  alt={item.image.alt || item.caption || ""}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              )
            )}

            {isClickable && (
              <span className="absolute right-3 bottom-3 flex h-9 w-9 scale-75 items-center justify-center rounded-full bg-black/70 text-white opacity-0 backdrop-blur-sm transition-all duration-200 group-hover:scale-100 group-hover:opacity-100 dark:bg-white/80 dark:text-black">
                <ArrowRight size={18} />
              </span>
            )}
          </div>
        );

        return (
          <div key={item._id} className="mb-6 break-inside-avoid">
            {isClickable ? (
              <Link href={item.link!} target="_blank" rel="noopener noreferrer" className="block">
                {media}
              </Link>
            ) : (
              media
            )}

            {item.caption && (
              <p className="mt-2 text-left text-xs text-black/50 dark:text-white/50">{item.caption}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
