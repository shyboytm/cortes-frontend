import { ShoppingBag } from "lucide-react";
import type { SanityImageSource } from "@sanity/image-url";
import { urlFor } from "@/sanity/image";
import MediaCard from "@/components/ui/MediaCard";

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
    <MediaCard
      id={id}
      title={title}
      href={url}
      likes={likes}
      imageUrl={image?.asset ? urlFor(image.asset).width(800).height(600).fit("crop").url() : undefined}
      imageAlt={image?.alt}
      aspectRatio="aspect-[4/3]"
      FallbackIcon={ShoppingBag}
      groupScope="card"
      imageSizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 420px"
      meta={
        <>
          {meta && (
            <p className="dot-font font-doto mt-1 text-xs tracking-widest text-black/60 uppercase dark:text-white/60">
              {meta}
            </p>
          )}
          {description && (
            <p className="mt-2 text-sm leading-relaxed text-black/60 dark:text-white/60">{description}</p>
          )}
        </>
      }
    />
  );
}
