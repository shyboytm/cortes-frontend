import { Disc3 } from "lucide-react";
import type { SanityImageSource } from "@sanity/image-url";
import { urlFor } from "@/sanity/image";
import MediaCard from "@/components/ui/MediaCard";

export interface MusicReleaseCardProps {
  id: string;
  title: string;
  artist: string;
  releaseType?: string;
  genre?: string;
  releaseYear?: string;
  link?: string;
  likes?: number;
  artwork?: {
    alt?: string;
    asset?: SanityImageSource;
  } | null;
}

const RELEASE_TYPE_LABELS: Record<string, string> = {
  album: "Album",
  ep: "EP",
  remix: "Remix",
  single: "Single",
};

// One release's card: square artwork (falls back to a plain disc icon if
// none is set), title, and a meta line of artist, release type, and year.
// The whole card links out to wherever the release lives.
export default function MusicReleaseCard({
  id,
  title,
  artist,
  releaseType,
  genre,
  releaseYear,
  link,
  likes,
  artwork,
}: MusicReleaseCardProps) {
  const meta = [artist, releaseType && (RELEASE_TYPE_LABELS[releaseType] ?? releaseType), releaseYear]
    .filter(Boolean)
    .join(" · ");

  return (
    <MediaCard
      id={id}
      title={title}
      href={link}
      likes={likes}
      imageUrl={artwork?.asset ? urlFor(artwork.asset).width(600).height(600).fit("crop").url() : undefined}
      imageAlt={artwork?.alt}
      aspectRatio="aspect-square"
      FallbackIcon={Disc3}
      groupScope="image"
      hoverSound
      likeButtonClassName="opacity-0 group-hover:opacity-100"
      imageSizes="(max-width: 768px) 50vw, 380px"
      meta={
        <>
          {meta && (
            <p className="dot-font font-doto mt-1 text-xs tracking-widest text-black/60 uppercase dark:text-white/60">
              {meta}
            </p>
          )}
          {genre && (
            <p className="mt-2 text-xs uppercase tracking-widest text-black/60 dark:text-white/60">{genre}</p>
          )}
        </>
      }
    />
  );
}
