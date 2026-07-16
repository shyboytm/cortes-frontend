import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ShoppingBag } from "lucide-react";
import type { SanityImageSource } from "@sanity/image-url";
import { urlFor } from "@/sanity/image";
import LikeButton from "@/components/ui/LikeButton";

export interface ProductCardProps {
  id: string;
  title: string;
  description?: string;
  priceLabel?: string;
  storefront?: string;
  url: string;
  likes?: number;
  image?: {
    alt?: string;
    asset?: SanityImageSource;
  } | null;
}

// One product's card on the Shop page — a 4:3 landscape image (matching
// the wide product-shot mockups Dennis uses, e.g. side-by-side phone
// screenshots), title, and a price/storefront meta line. Same visual
// language as MusicReleaseCard/FeedGrid: hover arrow badge in the corner,
// plus a like button (always visible below lg, hover-revealed at lg, same
// as Feed). This site never runs its own checkout: the whole card just
// links out to wherever the product is actually sold (Gumroad, Etsy, a
// Notion template marketplace, etc.).
export default function ProductCard({
  id,
  title,
  description,
  priceLabel,
  storefront,
  url,
  likes,
  image,
}: ProductCardProps) {
  const meta = [priceLabel, storefront].filter(Boolean).join(" · ");

  return (
    <Link href={url} target="_blank" rel="noopener noreferrer" className="group block">
      <div className="flex flex-col gap-3">
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-sm border border-black/10 bg-black/5 dark:border-white/10 dark:bg-white/5">
          {image?.asset ? (
            <Image
              src={urlFor(image.asset).width(800).height(600).fit("crop").url()}
              alt={image.alt || title}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-black/20 dark:text-white/20">
              <ShoppingBag size={40} />
            </div>
          )}

          <span className="absolute right-3 bottom-3 flex h-9 w-9 scale-75 items-center justify-center rounded-full border border-black/20 bg-white/80 text-black opacity-0 backdrop-blur-sm transition-all duration-200 group-hover:scale-100 group-hover:opacity-100 dark:border-white/20 dark:bg-black/70 dark:text-white">
            <ArrowUpRight size={16} />
          </span>

          <LikeButton id={id} initialLikes={likes ?? 0} variant="corner" />
        </div>

        <div>
          <h3 className="text-lg font-normal tracking-wide text-black dark:text-white">{title}</h3>
          {meta && (
            <p className="dot-font font-doto mt-1 text-xs tracking-widest text-black/60 uppercase dark:text-white/60">
              {meta}
            </p>
          )}
          {description && (
            <p className="mt-2 text-sm leading-relaxed text-black/60 dark:text-white/60">{description}</p>
          )}
        </div>
      </div>
    </Link>
  );
}
