import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Disc3 } from "lucide-react";
import type { SanityImageSource } from "@sanity/image-url";
import { urlFor } from "@/sanity/image";
import LikeButton from "@/components/ui/LikeButton";

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

// One release's card in the Music page grid and the /music/releases index:
// square artwork (falls back to a plain disc icon if none is set), title,
// and a small meta line — artist, release type, and year. The whole card
// links out to wherever the release actually lives (Bandcamp, Spotify, etc).
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

  const card = (
    <div className="flex flex-col gap-3">
      <div className="group relative aspect-square w-full overflow-hidden rounded-sm border border-black/10 bg-black/5 dark:border-white/10 dark:bg-white/5">
        {artwork?.asset ? (
          <Image
            src={urlFor(artwork.asset).width(600).height(600).fit("crop").url()}
            alt={artwork.alt || title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-black/20 dark:text-white/20">
            <Disc3 size={40} />
          </div>
        )}

        {link && (
          <span className="absolute right-3 bottom-3 flex h-9 w-9 scale-75 items-center justify-center rounded-full bg-black/70 text-white opacity-0 backdrop-blur-sm transition-all duration-200 group-hover:scale-100 group-hover:opacity-100 dark:bg-white/80 dark:text-black">
            <ArrowUpRight size={16} />
          </span>
        )}

        <LikeButton id={id} initialLikes={likes ?? 0} variant="corner" className="opacity-0 group-hover:opacity-100" />
      </div>

      <div>
        <h3 className="text-lg font-normal tracking-wide text-black dark:text-white">{title}</h3>
        {meta && (
          <p className="dot-font font-doto mt-1 text-xs tracking-widest text-black/60 uppercase dark:text-white/60">
            {meta}
          </p>
        )}
        {genre && (
          <p className="mt-2 text-xs uppercase tracking-widest text-black/60 dark:text-white/60">{genre}</p>
        )}
      </div>
    </div>
  );

  if (!link) {
    return card;
  }

  return (
    <Link href={link} target="_blank" rel="noopener noreferrer" className="block">
      {card}
    </Link>
  );
}
