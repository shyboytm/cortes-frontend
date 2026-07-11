'use client';

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { SanityImageSource } from "@sanity/image-url";
import { urlFor } from "@/sanity/image";
import { cn } from "@/lib/utils";

export interface WorkRowPhoto {
  _key: string;
  alt?: string;
  asset?: SanityImageSource;
  // Real width/height from Sanity's image metadata, used so each frame
  // keeps its native proportions instead of being force-cropped to a
  // single shape (matches the mixed portrait/landscape row in the design).
  aspectRatio?: number | null;
}

export interface WorkRowProps {
  title: string;
  dateRange?: string;
  // Sanity's GROQ projection returns null (not undefined) when a work
  // document has no photos yet, so this has to be handled explicitly below
  // rather than relying on a default parameter value.
  photos?: WorkRowPhoto[] | null;
  // Slug + whether the case study field has any content — both come from
  // the homepage's WORK_QUERY. The "View More" link only renders when both
  // are present, so projects without a written case study don't get a
  // dead-end button.
  slug?: string;
  hasCaseStudy?: boolean;
}

// One project's row on the homepage: title + date range up top, then a
// horizontally-scrolling strip of every photo attached to that work post
// in Sanity. Renders nothing if the post has no photos yet.
export default function WorkRow({ title, dateRange, photos, slug, hasCaseStudy }: WorkRowProps) {
  const safePhotos = photos ?? [];
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Tracks whether there's more to see in either direction, so the arrow
  // buttons only show up when they'd actually do something — this is the
  // main "how do I see the rest of this" affordance for anyone without an
  // easy horizontal-scroll input (a plain vertical mouse wheel, no trackpad).
  const updateScrollState = () => {
    const el = scrollerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    updateScrollState();
    const el = scrollerRef.current;
    if (!el) return;

    const onResize = () => updateScrollState();
    el.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", onResize);
    };
  }, [safePhotos.length]);

  const scrollByAmount = (direction: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: "smooth" });
  };

  // Click-and-drag support for mice without horizontal scroll at all.
  const drag = useRef<{ startX: number; startScrollLeft: number } | null>(null);
  // CSS scroll-snap fights a manually-assigned scrollLeft — the browser keeps
  // trying to pull the row back to the nearest snap point mid-drag, which is
  // what caused the jumpy/jarring motion. Snapping is only useful once you
  // let go, so it's switched off for the duration of the drag itself.
  const [isDragging, setIsDragging] = useState(false);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = scrollerRef.current;
    if (!el) return;
    drag.current = { startX: e.clientX, startScrollLeft: el.scrollLeft };
    setIsDragging(true);
    el.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = scrollerRef.current;
    if (!el || !drag.current) return;
    el.scrollLeft = drag.current.startScrollLeft - (e.clientX - drag.current.startX);
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = scrollerRef.current;
    drag.current = null;
    setIsDragging(false);
    el?.releasePointerCapture(e.pointerId);
  };

  if (safePhotos.length === 0) {
    return null;
  }

  // Only show the button when there's actually somewhere for it to go.
  const showViewMore = Boolean(hasCaseStudy && slug);

  return (
    <section className="w-full border-t border-black/10 pt-6 pb-10 dark:border-white/10">
      <div className="mb-6 flex flex-col gap-3 px-6 md:flex-row md:items-end md:justify-between md:px-10">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-normal text-black md:text-4xl dark:text-white">{title}</h2>
          {dateRange && (
            <p className="dot-font font-doto text-sm tracking-widest text-black/40 uppercase dark:text-white/80">
              {dateRange}
            </p>
          )}
        </div>

        {showViewMore && (
          <Link
            href={`/work/${slug}`}
            className="dot-font font-doto w-fit text-xs tracking-widest text-black/60 uppercase underline underline-offset-4 transition-colors hover:text-black dark:text-white/60 dark:hover:text-white"
          >
            View More
          </Link>
        )}
      </div>

      <div className="group relative">
        <div
          ref={scrollerRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          className={cn(
            "scrollbar-hide flex gap-3 overflow-x-auto px-6 md:px-10 cursor-grab active:cursor-grabbing",
            isDragging ? "snap-none" : "snap-x snap-mandatory"
          )}
        >
          {safePhotos.map((photo) => {
            const ratio = photo.aspectRatio && photo.aspectRatio > 0 ? photo.aspectRatio : 16 / 9;

            return (
              <div
                key={photo._key}
                className="relative h-[320px] flex-none snap-start overflow-hidden rounded-sm border border-black/10 bg-black/5 md:h-[420px] dark:border-white/10 dark:bg-white/5"
                style={{ aspectRatio: ratio }}
              >
                {photo.asset && (
                  <Image
                    src={urlFor(photo.asset).width(1600).fit("max").url()}
                    alt={photo.alt || title}
                    fill
                    draggable={false}
                    className="pointer-events-none object-cover"
                    sizes="(max-width: 768px) 80vw, 40vw"
                  />
                )}
              </div>
            );
          })}
        </div>

        <button
          type="button"
          aria-label="Scroll left"
          onClick={() => scrollByAmount(-1)}
          className={cn(
            "absolute top-1/2 left-2 z-10 -translate-y-1/2 rounded-full border border-white/10 bg-black/70 p-2 text-white opacity-0 backdrop-blur-sm transition-opacity duration-200 hover:bg-black/90 group-hover:opacity-100 md:left-4",
            !canScrollLeft && "pointer-events-none opacity-0!"
          )}
        >
          <ChevronLeft size={20} />
        </button>

        <button
          type="button"
          aria-label="Scroll right"
          onClick={() => scrollByAmount(1)}
          className={cn(
            "absolute top-1/2 right-2 z-10 -translate-y-1/2 rounded-full border border-white/10 bg-black/70 p-2 text-white opacity-0 backdrop-blur-sm transition-opacity duration-200 hover:bg-black/90 group-hover:opacity-100 md:right-4",
            !canScrollRight && "pointer-events-none opacity-0!"
          )}
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </section>
  );
}
