import { type SanityImageSource } from "@sanity/image-url";
import { client, sanityFetchOptions } from "@/sanity/client";
import { urlFor } from "@/sanity/image";
import PrimaryNav from "@/components/ui/PrimaryNav";
import PageHeader from "@/components/ui/PageHeader";
import PhotoGrid, { type PhotoItem } from "@/components/ui/PhotoGrid";

interface PhotoDocument {
  _id: string;
  caption?: string;
  camera?: string;
  lens?: string;
  dateTaken?: string;
  image?: {
    alt?: string;
    asset?: SanityImageSource;
    aspectRatio?: number | null;
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
  image{
    alt,
    asset,
    "aspectRatio": asset->metadata.dimensions.aspectRatio
  }
}`;

const options = sanityFetchOptions(900);

// Full-bleed masonry photo gallery with a click-to-open lightbox, replacing
// the previous external link out to glass.photo. Shows an empty-state
// message until photos are uploaded in Sanity.
export default async function PhotosPage() {
  const photos = await client.fetch<PhotoDocument[]>(PHOTOS_QUERY, {}, options);

  const items: PhotoItem[] = photos
    .filter((photo) => photo.image?.asset)
    .map((photo) => ({
      _id: photo._id,
      src: urlFor(photo.image!.asset!).width(1600).fit("max").url(),
      alt: photo.image?.alt || photo.caption || "Photo",
      caption: photo.caption,
      camera: photo.camera,
      lens: photo.lens,
      dateTaken: photo.dateTaken,
      aspectRatio:
        photo.image?.aspectRatio && photo.image.aspectRatio > 0 ? photo.image.aspectRatio : 4 / 5,
    }));

  return (
    <div className="pt-32 pb-24">
      <PrimaryNav />

      <div className="px-6">
        <PageHeader title="Photos" subtitle="A collection of photography I've shot over the years." />

        <PhotoGrid photos={items} />
      </div>
    </div>
  );
}
