import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { SanityImageSource } from "@sanity/image-url";
import { urlFor } from "@/sanity/image";
import { cn } from "@/lib/utils";

export interface WorkRowImage {
  alt?: string;
  asset?: SanityImageSource;
}

export interface WorkRowProps {
  title: string;
  dateRange?: string;
  // Sanity returns null (not undefined) for an unset image field, so both
  // are handled explicitly below.
  mainImage?: WorkRowImage | null;
  hoverImage?: WorkRowImage | null;
  // Slug + whether the case study field has any content — both come from
  // the homepage's WORK_QUERY. The whole card only becomes a link when both
  // are present, so projects without a written case study don't get a
  // dead-end click target.
  slug?: string;
  hasCaseStudy?: boolean;
}

// Every homepage thumbnail is cropped to this exact box (via Sanity's
// width+height image URL params, which crop around the image's hotspot) so
// the grid reads as one consistent size/shape instead of a mix of whatever
// aspect ratio each source photo happens to be.
const THUMB_WIDTH = 1200;
const THUMB_HEIGHT = 900;

// One project's card on the homepage: a thumbnail (crossfades to a second
// image on hover, if one's set in Sanity), the title and date range, and an
// arrow badge that appears on hover. The whole card links to the case study
// page once one's been written — otherwise it's just a static preview.
export default function WorkRow({ title, dateRange, mainImage, hoverImage, slug, hasCaseStudy }: WorkRowProps) {
  const hasHoverImage = Boolean(hoverImage?.asset);
  const isClickable = Boolean(hasCaseStudy && slug);

  const card = (
    <div className="flex flex-col gap-3">
      <div
        className="group relative w-full overflow-hidden rounded-sm border border-black/10 bg-black/5 dark:border-white/10 dark:bg-white/5"
        style={{ aspectRatio: THUMB_WIDTH / THUMB_HEIGHT }}
      >
        {mainImage?.asset && (
          <Image
            src={urlFor(mainImage.asset).width(THUMB_WIDTH).height(THUMB_HEIGHT).url()}
            alt={mainImage.alt || title}
            fill
            className={cn(
              "object-cover transition-opacity duration-300",
              hasHoverImage && "group-hover:opacity-0"
            )}
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        )}

        {hasHoverImage && (
          <Image
            src={urlFor(hoverImage!.asset!).width(THUMB_WIDTH).height(THUMB_HEIGHT).url()}
            alt={hoverImage?.alt || title}
            fill
            className="object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        )}

        {isClickable && (
          <span className="absolute right-3 bottom-3 flex h-9 w-9 scale-75 items-center justify-center rounded-full border border-black/20 bg-white/80 text-black opacity-0 backdrop-blur-sm transition-all duration-200 group-hover:scale-100 group-hover:opacity-100 dark:border-white/20 dark:bg-black/70 dark:text-white">
            <ArrowRight size={18} />
          </span>
        )}
      </div>

      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-normal tracking-wide text-black dark:text-white">{title}</h2>
        {dateRange && (
          <p className="dot-font font-doto shrink-0 text-xs tracking-widest text-black/60 uppercase dark:text-white/60">
            {dateRange}
          </p>
        )}
      </div>
    </div>
  );

  if (!isClickable) {
    return card;
  }

  return (
    <Link href={`/work/${slug}`} className="block">
      {card}
    </Link>
  );
}
