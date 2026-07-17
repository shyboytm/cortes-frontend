'use client'

import { useState } from "react"
import Image from "next/image"
import PhotoLightbox from "@/components/ui/PhotoLightbox"

export interface PhotoItem {
  _id: string
  src: string
  alt: string
  caption?: string
  camera?: string
  lens?: string
  dateTaken?: string
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
      <div className="columns-2 gap-4 sm:columns-3 lg:columns-4">
        {photos.map((photo, index) => (
          <button
            key={photo._id}
            type="button"
            onClick={() => setSelectedIndex(index)}
            className="group relative mb-4 block w-full cursor-zoom-in overflow-hidden rounded-sm border border-black/10 bg-black/5 break-inside-avoid dark:border-white/10 dark:bg-white/5"
            style={{ aspectRatio: photo.aspectRatio }}
            aria-label={`Open ${photo.alt} full screen`}
          >
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          </button>
        ))}
      </div>

      {selectedIndex !== null && (
        <PhotoLightbox
          photos={photos}
          selectedIndex={selectedIndex}
          onClose={() => setSelectedIndex(null)}
          onSelect={setSelectedIndex}
        />
      )}
    </>
  )
}
