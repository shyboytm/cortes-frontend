'use client'

import { useEffect, useRef } from "react"
import Image from "next/image"
import { Aperture, Calendar, ChevronLeft, ChevronRight, Camera as CameraIcon, MapPin, Settings2, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useLockBodyScroll } from "@/lib/hooks/useLockBodyScroll"
import LikeButton from "@/components/ui/LikeButton"
import type { PhotoItem } from "@/components/ui/PhotoGrid"

export interface PhotoLightboxProps {
  photos: PhotoItem[]
  selectedIndex: number
  onClose: () => void
  onSelect: (index: number) => void
}

// Full-screen photo viewer: a scrollable filmstrip of every photo down the
// left edge, and the selected photo alongside its caption/camera/lens/date
// (stacked on mobile, side by side to the right of the image on desktop).
// Closes on Escape, backdrop click, or the close button; steps through
// photos via the arrow buttons, Left/Right keys, or clicking a filmstrip
// thumbnail. Each photo has a small thumbnail size (used here and in the
// grid) and a larger size that's only downloaded once it's the one open.
export default function PhotoLightbox({ photos, selectedIndex, onClose, onSelect }: PhotoLightboxProps) {
  const activeThumbRef = useRef<HTMLButtonElement>(null)
  const photo = photos[selectedIndex]

  // Locks background scroll while the lightbox is open.
  useLockBodyScroll(true)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
      if (event.key === "ArrowRight") onSelect((selectedIndex + 1) % photos.length)
      if (event.key === "ArrowLeft") onSelect((selectedIndex - 1 + photos.length) % photos.length)
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [selectedIndex, photos.length, onClose, onSelect])

  // Keeps the active filmstrip thumbnail in view as selection changes.
  useEffect(() => {
    activeThumbRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" })
  }, [selectedIndex])

  if (!photo) return null

  const formattedDate = photo.dateTaken
    ? new Date(`${photo.dateTaken}T00:00:00`).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null

  const hasMeta = Boolean(
    photo.caption || photo.camera || photo.lens || photo.settings || photo.location || formattedDate
  )

  return (
    <div className="glass fixed inset-0 z-[60] flex bg-white/80 dark:bg-black/80" onClick={onClose}>
      <div
        onClick={(event) => event.stopPropagation()}
        className="scrollbar-hide h-full w-20 shrink-0 overflow-y-auto py-4 pl-2 pr-6 sm:w-24 lg:w-32 xl:w-36"
      >
        <div className="flex flex-col gap-2">
          {photos.map((thumb, index) => (
            <button
              key={thumb._id}
              type="button"
              ref={index === selectedIndex ? activeThumbRef : undefined}
              onClick={() => onSelect(index)}
              className={cn(
                "relative block w-full shrink-0 cursor-pointer overflow-hidden rounded-sm border transition-all duration-200 ease-out",
                index === selectedIndex
                  ? "translate-x-4 border-black opacity-100 dark:border-white"
                  : "translate-x-0 border-black/10 opacity-50 hover:opacity-80 dark:border-white/10"
              )}
              style={{ aspectRatio: thumb.aspectRatio }}
              aria-label={`Show ${thumb.alt}`}
            >
              <Image
                src={thumb.thumbSrc}
                alt={thumb.alt}
                fill
                placeholder={thumb.blurDataURL ? "blur" : undefined}
                blurDataURL={thumb.blurDataURL}
                className="object-cover"
                sizes="144px"
              />
            </button>
          ))}
        </div>
      </div>

      <div
        onClick={(event) => event.stopPropagation()}
        className="flex flex-1 flex-col items-center justify-center gap-6 p-6 sm:p-10 lg:flex-row lg:gap-10"
      >
        <div
          className="relative max-h-[80vh] max-w-4xl overflow-hidden lg:max-w-5xl xl:max-w-6xl 2xl:max-w-7xl"
          // Width is derived from the photo's real aspect ratio and the 80vh
          // height budget (rather than stretching to w-full), so the box
          // itself is always the right shape for the photo, even before the
          // image has loaded in. Previously the box was always full-width,
          // so aspect-ratio had to shrink it after the fact via max-height,
          // which the blur placeholder (rendered with cover-style sizing)
          // didn't respect, making portrait photos look like a square blob
          // while loading. Landscape photos still get capped by max-w-*, and
          // the shorter/narrower dimension follows automatically since both
          // are tied together by aspect-ratio.
          style={{ aspectRatio: photo.aspectRatio, width: `min(100%, calc(${photo.aspectRatio} * 80vh))` }}
        >
          <Image
            // Keyed by photo id so switching photos remounts the <img>
            // instead of just swapping its src. Without this, the browser
            // keeps painting the previous photo's pixels until the new
            // fullSrc finishes downloading (a native <img> behavior); the
            // blur placeholder never gets a chance to show because Next
            // only renders it for an image it hasn't already loaded once.
            key={photo._id}
            src={photo.fullSrc}
            alt={photo.alt}
            fill
            placeholder={photo.blurDataURL ? "blur" : undefined}
            blurDataURL={photo.blurDataURL}
            className="object-contain"
            sizes="(max-width: 1024px) 90vw, 75vw"
            priority
          />
        </div>

        {hasMeta && (
          <div className="flex w-full max-w-md flex-col gap-2 lg:w-72 lg:max-w-none lg:shrink-0">
            {photo.caption && (
              <p className="font-space-mono text-base text-black dark:text-white">{photo.caption}</p>
            )}
            {photo.location && (
              <div className="flex items-center gap-2 text-sm text-black/60 dark:text-white/60">
                <MapPin size={16} className="shrink-0" />
                <span>{photo.location}</span>
              </div>
            )}
            {photo.camera && (
              <div className="flex items-center gap-2 text-sm text-black/60 dark:text-white/60">
                <CameraIcon size={16} className="shrink-0" />
                <span>{photo.camera}</span>
              </div>
            )}
            {photo.lens && (
              <div className="flex items-center gap-2 text-sm text-black/60 dark:text-white/60">
                <Aperture size={16} className="shrink-0" />
                <span>{photo.lens}</span>
              </div>
            )}
            {photo.settings && (
              <div className="flex items-center gap-2 text-sm text-black/60 dark:text-white/60">
                <Settings2 size={16} className="shrink-0" />
                <span>{photo.settings}</span>
              </div>
            )}
            {formattedDate && (
              <div className="flex items-center gap-2 text-sm text-black/60 dark:text-white/60">
                <Calendar size={16} className="shrink-0" />
                <span>{formattedDate}</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div
        onClick={(event) => event.stopPropagation()}
        className="absolute top-6 right-6 flex items-center gap-2"
      >
        <div className="flex items-center gap-1 rounded-full border border-black/20 bg-white/80 p-1 text-black/70 backdrop-blur-sm dark:border-white/20 dark:bg-black/70 dark:text-white/70">
          <button
            type="button"
            onClick={() => onSelect((selectedIndex - 1 + photos.length) % photos.length)}
            aria-label="Previous photo"
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-black/10 hover:text-black dark:hover:bg-white/10 dark:hover:text-white"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={() => onSelect((selectedIndex + 1) % photos.length)}
            aria-label="Next photo"
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-black/10 hover:text-black dark:hover:bg-white/10 dark:hover:text-white"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        <LikeButton id={photo._id} initialLikes={photo.likes ?? 0} variant="toolbar" />

        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-black/20 bg-white/80 text-black/70 transition-colors hover:text-black dark:border-white/20 dark:bg-black/70 dark:text-white/70 dark:hover:text-white"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  )
}
