"use client";

import Image from "next/image";
import { Disc3 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface VinylDiscProps {
  imageUrl?: string;
  imageAlt?: string;
  // Diameter in px — the label hole and center spindle scale with it so the
  // same proportions hold whether this is a small footer badge or a big
  // decorative centerpiece.
  size?: number;
  className?: string;
}

// A spinning record: black disc + groove rings + album art as the center
// label, falling back to a plain disc icon if there's no art. Same visual
// language as the footer's "now playing" vinyl, just pulled out into its
// own component since this one isn't tied to Last.fm — it's handed whatever
// artwork the caller wants to show off instead.
export default function VinylDisc({ imageUrl, imageAlt, size = 64, className }: VinylDiscProps) {
  const labelSize = Math.round(size * 0.4375);

  return (
    <div
      className={cn(
        "relative shrink-0 rounded-full bg-black shadow-inner [animation:spin_7s_linear_infinite] motion-reduce:animate-none dark:bg-neutral-800",
        className
      )}
      style={{ width: size, height: size }}
    >
      <div
        className="absolute inset-0 rounded-full"
        style={{
          backgroundImage:
            "repeating-radial-gradient(circle at center, transparent 0px, transparent 3px, rgba(255,255,255,0.12) 4px)",
        }}
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full border border-white/20 bg-black/40"
        style={{ width: labelSize, height: labelSize }}
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={imageAlt || ""}
            fill
            draggable={false}
            onDragStart={(e) => e.preventDefault()}
            className="pointer-events-none object-cover select-none"
            sizes={`${labelSize}px`}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-white/60">
            <Disc3 size={Math.round(labelSize * 0.4)} />
          </div>
        )}
      </div>
      <div className="absolute top-1/2 left-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/70" />
    </div>
  );
}
