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
  aspectRatio: string;
  FallbackIcon: ComponentType<{ size?: number }>;
  meta?: ReactNode;
  likeButtonClassName?: string;
  imageSizes: string;
  groupScope?: "card" | "image";
  hoverSound?: boolean;
}

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
