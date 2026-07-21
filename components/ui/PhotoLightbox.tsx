'use client'

import { useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  Aperture,
  ArrowUpRight,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Camera as CameraIcon,
  MapPin,
  Settings2,
  ShoppingBag,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useLockBodyScroll } from "@/lib/hooks/useLockBodyScroll"
import LikeButton from "@/components/ui/LikeButton"
import { buttonVariants } from "@/components/ui/button"

// Shared by the Photos grid (camera/lens/settings/location/date all set,
// no link) and the Work page's Feed grid (just caption + an optional
// external link, everything else left undefined and simply not rendered).
export interface LightboxItem {
  _id: string
  // Small size used for the grid tile and lightbox filmstrip thumbnail.
  thumbSrc: string
  // Larger size only downloaded once this item is open in the lightbox.
  fullSrc: string
  // Base64 low-quality placeholder (Sanity's auto-generated LQIP), shown
  // as a blurred preview while the real image loads in.
  blurDataURL?: string
  alt: string
  caption?: string
  camera?: string
  lens?: string
  dateTaken?: string
  settings?: string
  location?: string
  // External link shown under the caption (Feed items only).
  link?: string
  // "Buy Print" button shown under the caption (Photos only).
  printsUrl?: string
  likes?: number
  aspectRatio: number
}

export interface PhotoLightboxProps {
  items: LightboxItem[]
  selectedIndex: number
  onClose: () => void
  onSelect: (index: number) => void
}

// Full-screen media viewer: a scrollable filmstrip of every item down the
// left edge, and the selected item alongside its caption/camera/lens/date/
// link (stacked on mobile, side by side to the right of the image on
// desktop). Closes on Escape, backdrop click, or the close button; steps
// through items via the arrow buttons, Left/Right keys, or clicking a
// filmstrip thumbnail. Each item has a small thumbnail size (used here and
// in the grid) and a larger size that's only downloaded once it's the one
// open.
export default function PhotoLightbox({ items, selectedIndex, onClose, onSelect }: PhotoLightboxProps) {
  const activeThumbRef = useRef<HTMLButtonElement>(null)
  const item = items[selectedIndex]

  // Locks background scroll while the lightbox is open
  useLockBodyScroll(true)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
      if (event.key === "ArrowRight") onSelect((selectedIndex + 1) % items.length)
      if (event.key === "ArrowLeft") onSelect((selectedIndex - 1 + items.length) % items.length)
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [selectedIndex, items.length, onClose, onSelect])

  // Keeps the active filmstrip thumbnail in view as selection changes.
  useEffect(() => {
    activeThumbRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" })
  }, [selectedIndex])

  if (!item) return null

  const formattedDate = item.dateTaken
    ? new Date(`${item.dateTaken}T00:00:00`).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null

  const hasMeta = Boolean(
    item.caption
      || item.camera
      || item.lens
      || item.settings
      || item.location
      || item.link
      || item.printsUrl
      || formattedDate
  )

  return (
    <div className="glass fixed inset-0 z-[60] flex bg-white/80 dark:bg-black/80" onClick={onClose}>
      <div
        onClick={(event) => event.stopPropagation()}
        className="scrollbar-hide h-full w-20 shrink-0 overflow-y-auto py-4 pl-2 pr-6 sm:w-24 lg:w-32 xl:w-36"
      >
        <div className="flex flex-col gap-2">
          {items.map((thumb, index) => (
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
          style={{ aspectRatio: item.aspectRatio, width: `min(100%, calc(${item.aspectRatio} * 80vh))` }}
        >
          <Image
            key={item._id}
            src={item.fullSrc}
            alt={item.alt}
            fill
            placeholder={item.blurDataURL ? "blur" : undefined}
            blurDataURL={item.blurDataURL}
            className="object-contain"
            sizes="(max-width: 1024px) 90vw, 75vw"
            priority
          />
        </div>

        {hasMeta && (
          <div className="flex w-full max-w-md flex-col gap-2 lg:w-72 lg:max-w-none lg:shrink-0">
            {item.caption && (
              <p className="font-space-mono mb-3 text-base text-black dark:text-white">{item.caption}</p>
            )}
            {item.printsUrl && (
              <Link
                href={item.printsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(buttonVariants({ variant: "secondary", size: "sm" }), "mb-2 w-fit")}
              >
                <ShoppingBag size={14} />
                Buy Print
              </Link>
            )}
            {item.link && (
              <Link
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="mb-1 flex w-fit items-center gap-2 text-sm text-black/70 underline decoration-black/30 underline-offset-4 transition-colors hover:text-black hover:decoration-black/60 dark:text-white/70 dark:decoration-white/30 dark:hover:text-white dark:hover:decoration-white/60"
              >
                <ArrowUpRight size={16} className="shrink-0" />
                <span>View link</span>
              </Link>
            )}
            {item.location && (
              <div className="flex items-center gap-2 text-sm text-black/60 dark:text-white/60">
                <MapPin size={16} className="shrink-0" />
                <span>{item.location}</span>
              </div>
            )}
            {item.camera && (
              <div className="flex items-center gap-2 text-sm text-black/60 dark:text-white/60">
                <CameraIcon size={16} className="shrink-0" />
                <span>{item.camera}</span>
              </div>
            )}
            {item.lens && (
              <div className="flex items-center gap-2 text-sm text-black/60 dark:text-white/60">
                <Aperture size={16} className="shrink-0" />
                <span>{item.lens}</span>
              </div>
            )}
            {item.settings && (
              <div className="flex items-center gap-2 text-sm text-black/60 dark:text-white/60">
                <Settings2 size={16} className="shrink-0" />
                <span>{item.settings}</span>
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
            onClick={() => onSelect((selectedIndex - 1 + items.length) % items.length)}
            aria-label="Previous"
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-black/10 hover:text-black dark:hover:bg-white/10 dark:hover:text-white"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={() => onSelect((selectedIndex + 1) % items.length)}
            aria-label="Next"
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-black/10 hover:text-black dark:hover:bg-white/10 dark:hover:text-white"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        <LikeButton id={item._id} initialLikes={item.likes ?? 0} variant="toolbar" />

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
