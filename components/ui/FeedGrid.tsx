import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
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
              <>
                {/* Dark scrim behind the caption so it stays legible no
                    matter how bright or busy the underlying image/video is —
                    the text alone can't rely on the page's light/dark theme
                    here since it's sitting on arbitrary media, not the
                    background. Both fade in together on hover, same
                    affordance as the link arrow badge below. */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/70 via-black/25 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                />
                <p
                  className={`absolute bottom-3 left-3 z-10 text-sm text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 ${
                    isClickable ? "right-14" : "right-3"
                  }`}
                  style={{ textShadow: "0 1px 3px rgba(0,0,0,0.9), 0 1px 10px rgba(0,0,0,0.6)" }}
                >
                  {item.caption}
                </p>
              </>
            )}

            {isClickable && (
              <span className="absolute right-3 bottom-3 z-10 flex h-9 w-9 scale-75 items-center justify-center rounded-full bg-black/70 text-white opacity-0 backdrop-blur-sm transition-all duration-200 group-hover:scale-100 group-hover:opacity-100 dark:bg-white/80 dark:text-black">
                <ArrowRight size={18} />
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
