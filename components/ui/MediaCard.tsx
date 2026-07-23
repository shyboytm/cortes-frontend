import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { ComponentType, ReactNode } from "react";
import LikeButton from "@/components/ui/LikeButton";
import { cn } from "@/lib/utils";

export interface MediaCardProps {
  id: string;
  title: string;
  href?: string;
  likes?: number;
  imageUrl?: string;
  imageAlt?: string;
  // Tailwind aspect-ratio class for the image wrapper, e.g. "aspect-[4/3]"
  // or "aspect-square".
  aspectRatio: string;
  // Icon shown in place of the image when there's no artwork/photo set.
  FallbackIcon: ComponentType<{ size?: number }>;
  // Secondary content rendered below the title (a meta line, genre tag,
  // description, etc.) — whatever each caller needs, or nothing.
  meta?: ReactNode;
  // Extra classes forwarded to the corner LikeButton (e.g. the hover-only
  // opacity classes MusicReleaseCard uses).
  likeButtonClassName?: string;
  // `sizes` attr for the underlying <Image>, since Product and Music
  // release grids use different column counts.
  imageSizes: string;
  // ProductCard's hover affordances (arrow badge, like button) key off
  // hovering the whole card, since "group" lives on the outer link.
  // MusicReleaseCard's key off hovering just the artwork, since "group"
  // lives on the image wrapper instead. Default matches MusicReleaseCard.
  groupScope?: "card" | "image";
  // Plays Cuelume's "tick" sound on hover, same as other hoverable cards
  // site-wide. Opt-in (only MusicReleaseCard turns it on) rather than
  // sitewide on this shared component, since it wasn't asked for on Shop's
  // ProductCard.
  hoverSound?: boolean;
}

// Shared markup for the Shop and Music release cards: a bordered image
// wrapper (falls back to an icon when there's no artwork), an ArrowUpRight
// hover badge in the corner, a corner LikeButton, and a title + meta slot
// underneath. ProductCard and MusicReleaseCard each just supply their own
// aspect ratio, fallback icon, and meta content.
export default function MediaCard({
  id,
  title,
  href,
  likes,
  imageUrl,
  imageAlt,
  aspectRatio,
  FallbackIcon,
  meta,
  likeButtonClassName,
  imageSizes,
  groupScope = "image",
  hoverSound,
}: MediaCardProps) {
  const card = (
    <div className="flex flex-col gap-3">
      <div
        className={cn(
          "relative w-full overflow-hidden rounded-sm border border-black/10 bg-black/5 dark:border-white/10 dark:bg-white/5",
          aspectRatio,
          groupScope === "image" && "group"
        )}
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={imageAlt || title}
            fill
            className="object-cover"
            sizes={imageSizes}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-black/20 dark:text-white/20">
            <FallbackIcon size={40} />
          </div>
        )}

        {href && (
          <span className="absolute right-3 bottom-3 flex h-9 w-9 scale-75 items-center justify-center rounded-full border border-black/20 bg-white/80 text-black opacity-0 backdrop-blur-sm transition-all duration-200 group-hover:scale-100 group-hover:opacity-100 dark:border-white/20 dark:bg-black/70 dark:text-white">
            <ArrowUpRight size={16} />
          </span>
        )}

        <LikeButton id={id} initialLikes={likes ?? 0} variant="corner" className={likeButtonClassName} />
      </div>

      <div>
        <h3 className="text-lg font-normal tracking-wide text-black dark:text-white">{title}</h3>
        {meta}
      </div>
    </div>
  );

  if (!href) {
    return card;
  }

  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn("block", groupScope === "card" && "group")}
      {...(hoverSound ? { "data-cuelume-hover": "tick" } : {})}
    >
      {card}
    </Link>
  );
}
