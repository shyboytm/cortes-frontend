import { type SanityImageSource } from "@sanity/image-url";
import { client, sanityFetchOptions } from "@/sanity/client";
import { urlFor } from "@/sanity/image";
import { shuffleArray } from "@/lib/utils";
import PrimaryNav from "@/components/ui/PrimaryNav";
import PageHeader from "@/components/ui/PageHeader";
import PhotoGrid, { type PhotoItem } from "@/components/ui/PhotoGrid";

interface PhotoDocument {
  _id: string;
  caption?: string;
  camera?: string;
  lens?: string;
  dateTaken?: string;
  settings?: string;
  location?: string;
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
  likes,
  image{
    alt,
    asset,
    "aspectRatio": asset->metadata.dimensions.aspectRatio,
    "lqip": asset->metadata.lqip
  }
}`;

const options = sanityFetchOptions(900);

// Full-bleed masonry photo gallery with a click-to-open lightbox, replacing
// the previous external link out to glass.photo. Shows an empty-state
// message until photos are uploaded in Sanity. Each photo resolves to two
// sizes: a small one for the grid tile and lightbox filmstrip, and a larger
// one only downloaded once that photo is actually open in the lightbox.
export default async function PhotosPage() {
  const photos = await client.fetch<PhotoDocument[]>(PHOTOS_QUERY, {}, options);

  // Randomized on every render (bounded by the fetch cache's revalidate
  // window above) so the gallery order isn't the same every visit.
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
      likes: photo.likes,
      aspectRatio:
        photo.image?.aspectRatio && photo.image.aspectRatio > 0 ? photo.image.aspectRatio : 4 / 5,
    }));

  return (
    <div className="pt-32 pb-24">
      <PrimaryNav />

      <div className="px-6">
        <PageHeader title="Photos" subtitle="A collection of my favorite photography I've shot over the years, with camera and lens details included." />

        <PhotoGrid photos={items} />
      </div>
    </div>
  );
}
