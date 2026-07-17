'use client'

import { useEffect, useRef } from "react"
import Image from "next/image"
import { Aperture, Calendar, ChevronLeft, ChevronRight, Camera as CameraIcon, X } from "lucide-react"
import { cn } from "@/lib/utils"
import type { PhotoItem } from "@/components/ui/PhotoGrid"

export interface PhotoLightboxProps {
  photos: PhotoItem[]
  selectedIndex: number
  onClose: () => void
  onSelect: (index: number) => void
}

// Full-screen photo viewer: a scrollable filmstrip of every photo down the
// left edge, the selected photo large and centered, and its caption/camera/
// lens/date underneath. Closes on Escape, backdrop click, or the close
// button; steps through photos via the arrow buttons, Left/Right keys, or
// clicking a filmstrip thumbnail.
export default function PhotoLightbox({ photos, selectedIndex, onClose, onSelect }: PhotoLightboxProps) {
  const activeThumbRef = useRef<HTMLButtonElement>(null)
  const photo = photos[selectedIndex]

  // Locks background scroll while the lightbox is open.
  useEffect(() => {
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = ""
    }
  }, [])

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
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null

  const hasMeta = Boolean(photo.caption || photo.camera || photo.lens || formattedDate)

  return (
    <div className="fixed inset-0 z-[60] flex bg-white/95 backdrop-blur-md dark:bg-black/95" onClick={onClose}>
      <div
        onClick={(event) => event.stopPropagation()}
        className="scrollbar-hide h-full w-20 shrink-0 overflow-y-auto px-2 py-4 sm:w-24"
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
                  ? "translate-x-2 border-black opacity-100 dark:border-white"
                  : "translate-x-0 border-black/10 opacity-50 hover:opacity-80 dark:border-white/10"
              )}
              style={{ aspectRatio: thumb.aspectRatio }}
              aria-label={`Show ${thumb.alt}`}
            >
              <Image src={thumb.src} alt={thumb.alt} fill className="object-cover" sizes="96px" />
            </button>
          ))}
        </div>
      </div>

      <div
        onClick={(event) => event.stopPropagation()}
        className="flex flex-1 flex-col items-center justify-center gap-4 p-6 sm:p-10"
      >
        <div className="relative max-h-[70vh] w-full max-w-4xl" style={{ aspectRatio: photo.aspectRatio }}>
          <Image
            src={photo.src}
            alt={photo.alt}
            fill
            className="object-contain"
            sizes="(max-width: 1024px) 90vw, 70vw"
            priority
          />
        </div>

        {hasMeta && (
          <div className="flex w-full max-w-md flex-col gap-2">
            {photo.caption && (
              <p className="text-base text-black dark:text-white">{photo.caption}</p>
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
        <div className="flex items-center gap-1 rounded-full border border-black/20 bg-white/80 p-1 text-black backdrop-blur-sm dark:border-white/20 dark:bg-black/70 dark:text-white">
          <button
            type="button"
            onClick={() => onSelect((selectedIndex - 1 + photos.length) % photos.length)}
            aria-label="Previous photo"
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-black/10 dark:hover:bg-white/10"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={() => onSelect((selectedIndex + 1) % photos.length)}
            aria-label="Next photo"
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-black/10 dark:hover:bg-white/10"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-black/20 bg-white/80 text-black transition-colors hover:text-black dark:border-white/20 dark:bg-black/70 dark:text-white"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  )
}
