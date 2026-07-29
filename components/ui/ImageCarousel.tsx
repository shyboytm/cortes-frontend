"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ImageCarouselSlide {
  key: string;
  src: string;
  alt: string;
  caption?: string;
}

export interface ImageCarouselProps {
  slides: ImageCarouselSlide[];
  className?: string;
}

const SWIPE_THRESHOLD = 50;

export default function ImageCarousel({ slides, className }: ImageCarouselProps) {
  const [index, setIndex] = useState(0);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  if (slides.length === 0) return null;

  const goTo = (next: number) => {
    setIndex(((next % slides.length) + slides.length) % slides.length);
  };

  const handleTouchStart = (event: React.TouchEvent) => {
    const touch = event.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (event: React.TouchEvent) => {
    const start = touchStartRef.current;
    touchStartRef.current = null;
    if (!start) return;

    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - start.x;
    const deltaY = touch.clientY - start.y;

    if (Math.abs(deltaX) < SWIPE_THRESHOLD || Math.abs(deltaX) < Math.abs(deltaY)) return;

    goTo(deltaX < 0 ? index + 1 : index - 1);
  };

  const active = slides[index];
  const hasMultiple = slides.length > 1;
  const showOverlayBar = hasMultiple || Boolean(active.caption);

  return (
    <div className={cn("flex flex-col", className)}>
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="relative h-[45vh] w-full touch-pan-y overflow-hidden select-none sm:h-[60vh] lg:h-[75vh]"
      >
        <Image
          key={active.key}
          src={active.src}
          alt={active.alt}
          fill
          className="object-contain"
          sizes="100vw"
          priority={index === 0}
        />

        {hasMultiple && (
          <>
            <button
              type="button"
              onClick={() => goTo(index - 1)}
              aria-label="Previous image"
              data-cuelume-hover="tick"
              data-cuelume-press
              className="absolute top-1/2 left-4 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-black/20 bg-white/80 text-black/70 backdrop-blur-sm transition-colors hover:text-black sm:left-6 dark:border-white/20 dark:bg-black/70 dark:text-white/70 dark:hover:text-white"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={() => goTo(index + 1)}
              aria-label="Next image"
              data-cuelume-hover="tick"
              data-cuelume-press
              className="absolute top-1/2 right-4 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-black/20 bg-white/80 text-black/70 backdrop-blur-sm transition-colors hover:text-black sm:right-6 dark:border-white/20 dark:bg-black/70 dark:text-white/70 dark:hover:text-white"
            >
              <ChevronRight size={18} />
            </button>

            <div className="dot-font absolute top-4 right-4 rounded-full border border-black/20 bg-white/80 px-2.5 py-1 font-doto text-[10px] tracking-widest text-black/70 uppercase backdrop-blur-sm dark:border-white/20 dark:bg-black/70 dark:text-white/70">
              {index + 1} / {slides.length}
            </div>
          </>
        )}

        {showOverlayBar && (
          <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-3 bg-gradient-to-t from-black/70 via-black/20 to-transparent px-6 pt-12 pb-4">
            {active.caption && (
              <p className="font-space-mono max-w-2xl text-center text-sm text-white/90 italic">
                {active.caption}
              </p>
            )}
            {hasMultiple && (
              <div className="flex items-center gap-2">
                {slides.map((slide, slideIndex) => (
                  <button
                    key={slide.key}
                    type="button"
                    onClick={() => goTo(slideIndex)}
                    aria-label={`Go to image ${slideIndex + 1}`}
                    data-cuelume-hover="tick"
                    data-cuelume-press
                    className={cn(
                      "h-1.5 cursor-pointer rounded-full transition-all",
                      slideIndex === index ? "w-6 bg-white" : "w-1.5 bg-white/40 hover:bg-white/60"
                    )}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
