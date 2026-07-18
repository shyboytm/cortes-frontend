'use client'

import { useState } from "react"
import Image from "next/image"
import PhotoLightbox from "@/components/ui/PhotoLightbox"
import LikeButton from "@/components/ui/LikeButton"

export interface PhotoItem {
  _id: string
  // Small size used for the grid tile and lightbox filmstrip thumbnail.
  thumbSrc: string
  // Larger size only downloaded once this photo is open in the lightbox.
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
  likes?: number
  aspectRatio: number
}

export interface PhotoGridProps {
  photos: PhotoItem[]
}

// Staggered masonry grid of photos built with CSS columns, so each image
// keeps its own natural aspect ratio instead of being cropped into a
// uniform cell. Clicking any photo opens it full-screen in PhotoLightbox
// alongside a filmstrip of every other photo.
export default function PhotoGrid({ photos }: PhotoGridProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  if (photos.length === 0) {
    return (
      <p className="text-black/60 dark:text-white/60">Nothing here yet — add a photo in Sanity to get started.</p>
    )
  }

  return (
    <>
      <div className="columns-1 gap-4 sm:columns-2 lg:columns-4">
        {photos.map((photo, index) => (
          // A <div> rather than a <button>, since it contains the nested
          // LikeButton — browsers don't allow interactive elements inside a
          // <button>. Keyboard-activatable via role/tabIndex/onKeyDown.
          <div
            key={photo._id}
            role="button"
            tabIndex={0}
            onClick={() => setSelectedIndex(index)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault()
                setSelectedIndex(index)
              }
            }}
            className="group relative mb-4 block w-full cursor-zoom-in overflow-hidden rounded-sm border border-black/10 bg-black/5 break-inside-avoid dark:border-white/10 dark:bg-white/5"
            style={{ aspectRatio: photo.aspectRatio }}
            aria-label={`Open ${photo.alt} full screen`}
          >
            <Image
              src={photo.thumbSrc}
              alt={photo.alt}
              fill
              placeholder={photo.blurDataURL ? "blur" : undefined}
              blurDataURL={photo.blurDataURL}
              className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 420px"
            />

            <LikeButton id={photo._id} initialLikes={photo.likes ?? 0} variant="corner" />
          </div>
        ))}
      </div>

      {selectedIndex !== null && (
        <PhotoLightbox
          items={photos}
          selectedIndex={selectedIndex}
          onClose={() => setSelectedIndex(null)}
          onSelect={setSelectedIndex}
        />
      )}
    </>
  )
}
