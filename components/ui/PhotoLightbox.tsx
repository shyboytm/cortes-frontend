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

// Minimum horizontal drag distance (in px) before a touch gesture counts as
// an intentional swipe rather than a tap or an incidental wobble.
const SWIPE_THRESHOLD = 50

// Full-screen media viewer: the selected item (plus its caption/camera/lens/
// date/link) fills the space above a horizontal filmstrip of every item
// pinned to the bottom of the viewport. Steps through items via the arrow
// buttons, Left/Right keys, a horizontal swipe on touch devices, or clicking
// a filmstrip thumbnail. Closes on Escape, the close button, or clicking
// anywhere that isn't the image itself or one of the interactive controls
// (filmstrip, toolbar, meta links) — mirroring PrimaryNav's click-outside-
// to-close overlay. Each item has a small thumbnail size (used here and in
// the grid) and a larger size that's only downloaded once it's the one open.
export default function PhotoLightbox({ items, selectedIndex, onClose, onSelect }: PhotoLightboxProps) {
  const activeThumbRef = useRef<HTMLButtonElement>(null)
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)
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

  // Keeps the active filmstrip thumbnail in view as selection changes —
  // `inline` covers the sm+ horizontal bar, `block` covers the mobile
  // vertical strip, and "nearest" on both means whichever axis isn't
  // actually scrollable is a no-op.
  useEffect(() => {
    activeThumbRef.current?.scrollIntoView({ inline: "nearest", block: "nearest", behavior: "smooth" })
  }, [selectedIndex])

  const handleTouchStart = (event: React.TouchEvent) => {
    const touch = event.touches[0]
    touchStartRef.current = { x: touch.clientX, y: touch.clientY }
  }

  const handleTouchEnd = (event: React.TouchEvent) => {
    const start = touchStartRef.current
    touchStartRef.current = null
    if (!start) return

    const touch = event.changedTouches[0]
    const deltaX = touch.clientX - start.x
    const deltaY = touch.clientY - start.y

    // Ignores short taps and mostly-vertical gestures so this doesn't
    // interfere with an accidental tap or scroll attempt.
    if (Math.abs(deltaX) < SWIPE_THRESHOLD || Math.abs(deltaX) < Math.abs(deltaY)) return

    if (deltaX < 0) {
      onSelect((selectedIndex + 1) % items.length)
    } else {
      onSelect((selectedIndex - 1 + items.length) % items.length)
    }
  }

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
    <div
      className="glass fixed inset-0 z-[60] flex cursor-zoom-out flex-col bg-white/80 dark:bg-black/80"
      onClick={onClose}
    >
      {/* Image + meta. No stopPropagation here (beyond the image/links
          themselves below) so clicking the surrounding empty space counts
          as clicking outside the image and closes the lightbox. */}
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="flex min-h-0 flex-1 flex-col items-center justify-center gap-6 p-6 sm:p-10 lg:flex-row lg:gap-10"
      >
        {/* No stopPropagation on this wrapper — it's sized to fill the
            available space so the lightbox can center the image, which
            would otherwise make "click outside the image" trigger from
            anywhere in that box, not just the image's own visible pixels.
            The Image below sizes itself intrinsically (no `fill`) so its
            own element bounds match what's actually rendered, and only it
            stops propagation. */}
        <div className="flex min-h-0 w-full max-w-4xl flex-1 items-center justify-center self-stretch lg:max-w-5xl xl:max-w-6xl 2xl:max-w-7xl">
          <Image
            key={item._id}
            src={item.fullSrc}
            alt={item.alt}
            width={2000}
            height={Math.max(1, Math.round(2000 / item.aspectRatio))}
            placeholder={item.blurDataURL ? "blur" : undefined}
            blurDataURL={item.blurDataURL}
            onClick={(event) => event.stopPropagation()}
            className="h-auto max-h-full w-auto max-w-full cursor-default"
            sizes="(max-width: 1024px) 90vw, 75vw"
            priority
          />
        </div>

        {hasMeta && (
          <div className="flex w-full max-w-md shrink-0 flex-col gap-2 lg:w-72 lg:max-w-none">
            {item.caption && (
              <p className="font-space-mono mb-3 text-xs text-black sm:text-sm lg:text-base dark:text-white">{item.caption}</p>
            )}
            {item.printsUrl && (
              <Link
                href={item.printsUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(event) => event.stopPropagation()}
                className={cn(buttonVariants({ variant: "secondary", size: "sm" }), "mb-3 w-fit")}
                data-cuelume-hover="tick"
                data-cuelume-press
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
                onClick={(event) => event.stopPropagation()}
                className="mb-1 flex w-fit items-center gap-2 text-sm text-black/70 underline decoration-black/30 underline-offset-4 transition-colors hover:text-black hover:decoration-black/60 dark:text-white/70 dark:decoration-white/30 dark:hover:text-white dark:hover:decoration-white/60"
              >
                <ArrowUpRight size={16} className="shrink-0" />
                <span>View link</span>
              </Link>
            )}
            {item.location && (
              <div className="flex items-center gap-2 text-xs text-black/60 sm:text-sm dark:text-white/60">
                <MapPin size={16} className="shrink-0" />
                <span>{item.location}</span>
              </div>
            )}
            {item.camera && (
              <div className="flex items-center gap-2 text-xs text-black/60 sm:text-sm dark:text-white/60">
                <CameraIcon size={16} className="shrink-0" />
                <span>{item.camera}</span>
              </div>
            )}
            {item.lens && (
              <div className="flex items-center gap-2 text-xs text-black/60 sm:text-sm dark:text-white/60">
                <Aperture size={16} className="shrink-0" />
                <span>{item.lens}</span>
              </div>
            )}
            {item.settings && (
              <div className="flex items-center gap-2 text-xs text-black/60 sm:text-sm dark:text-white/60">
                <Settings2 size={16} className="shrink-0" />
                <span>{item.settings}</span>
              </div>
            )}
            {formattedDate && (
              <div className="flex items-center gap-2 text-xs text-black/60 sm:text-sm dark:text-white/60">
                <Calendar size={16} className="shrink-0" />
                <span>{formattedDate}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Filmstrip: hidden entirely on mobile (swipe/arrows are the only
          way to step through items there) — pinned to the bottom of the
          viewport and scrolling horizontally from sm+ up. */}
      <div
        onClick={(event) => event.stopPropagation()}
        className="scrollbar-hide hidden shrink-0 cursor-default items-center gap-2 overflow-x-auto overflow-y-hidden px-4 py-2 sm:flex sm:h-24 sm:w-full sm:px-6 sm:py-3 lg:h-28 xl:h-32"
      >
        {items.map((thumb, index) => (
          <button
            key={thumb._id}
            type="button"
            ref={index === selectedIndex ? activeThumbRef : undefined}
            onClick={() => onSelect(index)}
            data-cuelume-hover="tick"
            data-cuelume-press
            className={cn(
              "relative block h-full w-auto shrink-0 cursor-pointer overflow-hidden rounded-sm border transition-all duration-200 ease-out",
              index === selectedIndex
                ? "-translate-y-2 border-black opacity-100 dark:border-white"
                : "translate-y-0 border-black/10 opacity-50 hover:opacity-80 dark:border-white/10"
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

      <div
        onClick={(event) => event.stopPropagation()}
        className="absolute top-6 right-6 flex cursor-default items-center gap-2"
      >
        <div className="flex items-center gap-1 rounded-full border border-black/20 bg-white/80 p-1 text-black/70 backdrop-blur-sm dark:border-white/20 dark:bg-black/70 dark:text-white/70">
          <button
            type="button"
            onClick={() => onSelect((selectedIndex - 1 + items.length) % items.length)}
            aria-label="Previous"
            data-cuelume-hover="tick"
            data-cuelume-press
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-black/10 hover:text-black dark:hover:bg-white/10 dark:hover:text-white"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={() => onSelect((selectedIndex + 1) % items.length)}
            aria-label="Next"
            data-cuelume-hover="tick"
            data-cuelume-press
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
          data-cuelume-hover="tick"
          data-cuelume-press
          className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-black/20 bg-white/80 text-black/70 transition-colors hover:text-black dark:border-white/20 dark:bg-black/70 dark:text-white/70 dark:hover:text-white"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  )
}
