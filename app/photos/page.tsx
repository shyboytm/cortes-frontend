import Link from "next/link";
import type { Metadata } from "next";
import { type SanityImageSource } from "@sanity/image-url";
import { Aperture, Camera, Instagram, ShoppingBag } from "lucide-react";
import { client, sanityFetchOptions } from "@/sanity/client";
import { urlFor } from "@/sanity/image";
import { shuffleArray } from "@/lib/utils";
import PrimaryNav from "@/components/ui/PrimaryNav";
import PageHeader from "@/components/ui/PageHeader";
import PhotoGrid, { type PhotoItem } from "@/components/ui/PhotoGrid";
import JumpNav from "@/components/ui/JumpNav";
import { buttonVariants } from "@/components/ui/button";
import { resolvePageMetadata } from "@/lib/page-meta";

const PHOTO_LINKS = [
  { label: "Buy Prints", href: "https://fineartamerica.com/profiles/dennis-cortes", Icon: ShoppingBag },
  { label: "Glass", href: "https://glass.photo/cortes", Icon: Aperture },
  { label: "Retro", href: "https://retro.app/@cortes", Icon: Camera },
  { label: "Instagram", href: "https://www.instagram.com/shyboytm/", Icon: Instagram },
];

interface PhotoDocument {
  _id: string;
  caption?: string;
  camera?: string;
  lens?: string;
  dateTaken?: string;
  settings?: string;
  location?: string;
  printsUrl?: string;
  likes?: number;
  image?: {
    alt?: string;
    asset?: SanityImageSource;
    aspectRatio?: number | null;
    lqip?: string | null;
  } | null;
}

const PHOTOS_QUERY = `*[
  _type == "photo"
  && defined(image.asset)
]|order(order asc, _createdAt desc){
  _id,
  caption,
  camera,
  lens,
  dateTaken,
  settings,
  location,
  printsUrl,
  likes,
  image{
    alt,
    asset,
    "aspectRatio": asset->metadata.dimensions.aspectRatio,
    "lqip": asset->metadata.lqip
  }
}`;

const options = sanityFetchOptions(900);

export async function generateMetadata(): Promise<Metadata> {
  return resolvePageMetadata(
    "photos",
    {
      title: "Photos",
      description:
        "A collection of my favorite photography I've shot over the years. Camera and lens info as well as buy print links included.",
    },
    "/photos"
  );
}

export default async function PhotosPage() {
  const photos = await client.fetch<PhotoDocument[]>(PHOTOS_QUERY, {}, options);

  const items: PhotoItem[] = shuffleArray(photos)
    .filter((photo) => photo.image?.asset)
    .map((photo) => ({
      _id: photo._id,
      thumbSrc: urlFor(photo.image!.asset!).width(800).fit("max").url(),
      fullSrc: urlFor(photo.image!.asset!).width(3200).fit("max").url(),
      blurDataURL: photo.image?.lqip || undefined,
      alt: photo.image?.alt || photo.caption || "Photo",
      caption: photo.caption,
      camera: photo.camera,
      lens: photo.lens,
      dateTaken: photo.dateTaken,
      settings: photo.settings,
      location: photo.location,
      printsUrl: photo.printsUrl,
      likes: photo.likes,
      aspectRatio:
        photo.image?.aspectRatio && photo.image.aspectRatio > 0 ? photo.image.aspectRatio : 4 / 5,
    }));

  return (
    <div className="pt-32 pb-24">
      <PrimaryNav />

      <div className="px-6">
        <PageHeader title="Photos" subtitle="A collection of my favorite photography I've shot over the years. Camera and lens info as well as buy print links included." />

        <JumpNav
          ariaLabel="Find my photography"
          sentinelId="photos-nav-sentinel"
          className="my-10 flex flex-wrap gap-3 border-b border-black/10 pb-10 dark:border-white/10"
          items={PHOTO_LINKS.map(({ label, href, Icon }) => (
            <Link
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              data-cuelume-hover="tick"
              data-cuelume-press
              className={buttonVariants({ variant: "secondary", size: "sm" })}
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
        />

        <PhotoGrid photos={items} />
      </div>
    </div>
  );
}
