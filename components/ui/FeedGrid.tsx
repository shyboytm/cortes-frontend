import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { SanityImageSource } from "@sanity/image-url";
import { urlFor } from "@/sanity/image";
import FeedVideo from "@/components/ui/FeedVideo";
import LikeButton from "@/components/ui/LikeButton";

export interface FeedItem {
  _id: string;
  caption?: string;
  link?: string;
  likes?: number;
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

            {item.caption && (
              // Solid drawer that slides up from the bottom edge on hover,
              // rather than a gradient scrim + drop-shadowed text sitting
              // on top of the media. Reads cleanly against any photo/video
              // since it's an opaque, theme-aware panel (not dependent on
              // what's underneath), and clips to the card's rounded
              // corners courtesy of the parent's overflow-hidden.
              <div className="absolute inset-x-0 bottom-0 z-10 flex translate-y-full items-center justify-between gap-4 border-t border-black/10 bg-white px-3 py-2.5 transition-transform duration-200 ease-out group-hover:translate-y-0 dark:border-white/10 dark:bg-black">
                <p className="line-clamp-2 text-sm text-black dark:text-white">{item.caption}</p>
                {isClickable && (
                  <ArrowUpRight size={20} className="shrink-0 text-black/60 dark:text-white/60" />
                )}
              </div>
            )}

            {isClickable && !item.caption && (
              <span className="absolute right-3 bottom-3 z-10 flex h-9 w-9 scale-75 items-center justify-center rounded-full border border-black/20 bg-white/80 text-black opacity-0 backdrop-blur-sm transition-all duration-200 group-hover:scale-100 group-hover:opacity-100 dark:border-white/20 dark:bg-black/70 dark:text-white">
                <ArrowUpRight size={20} />
              </span>
            )}

            <LikeButton id={item._id} initialLikes={item.likes ?? 0} variant="corner" />
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
          </div>
        );
      })}
    </div>
  );
}
