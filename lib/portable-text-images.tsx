import Image from "next/image";
import type { PortableTextComponents } from "@portabletext/react";
import { urlFor } from "@/sanity/image";

// Shared image-handling for Sanity PortableText bodies (blog posts, work
// case studies). Both schemas define the same `alt` / `caption` / `size`
// fields on their body images, so the width treatment, numbered captions,
// and half-width pairing behave identically across both.
export type PortableImageBlock = {
  _type: "image";
  _key: string;
  alt?: string;
  caption?: string;
  size?: "inset" | "half" | "third" | "wide" | "full" | "offsetLeft" | "offsetRight";
  aspectRatio?: number | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  asset?: any;
};

// "half" and "third" images pair up with however many more images of the
// same size immediately follow them (1 more for half, 2 more for third),
// grouped into a single synthetic "imageRow" block so they render side by
// side instead of stacked. A run that comes up short (e.g. a lone "half" or
// two "third"s in a row with nothing left to pair with) just falls through
// and renders each image on its own at inset width.
const GROUP_SIZES: Partial<Record<NonNullable<PortableImageBlock["size"]>, number>> = {
  half: 2,
  third: 3,
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function groupAdjacentImages(blocks: any[]): any[] {
  const result: any[] = []; // eslint-disable-line @typescript-eslint/no-explicit-any
  let i = 0;
  while (i < blocks.length) {
    const block = blocks[i];
    const groupSize = block?._type === "image" && block.size ? GROUP_SIZES[block.size as NonNullable<PortableImageBlock["size"]>] : undefined;

    if (groupSize) {
      const group = [block];
      let j = i + 1;
      while (group.length < groupSize && blocks[j]?._type === "image" && blocks[j].size === block.size) {
        group.push(blocks[j]);
        j += 1;
      }
      if (group.length > 1) {
        result.push({ _type: "imageRow", _key: `${block._key}-row`, images: group });
        i = j;
        continue;
      }
    }

    result.push(block);
    i += 1;
  }
  return result;
}

// Width/position treatment per image. "inset" matches the text column,
// "wide" breaks past it a bit, "full" bleeds edge-to-edge, "half"/"third"
// are only meaningful paired inside an imageRow (a lone one just renders
// inset), and "offsetLeft"/"offsetRight" break out past the column on just
// one side — reusing the same viewport-edge trick as "full" but on a single
// margin, so the image's other edge stays put where the text column ends.
function sizeWrapperClass(size: PortableImageBlock["size"]) {
  switch (size) {
    case "full":
      return "mx-[calc(50%-50vw)] w-screen";
    case "wide":
      return "-mx-6 sm:-mx-12 md:-mx-16";
    case "offsetLeft":
      return "ml-[calc(50%-50vw)] mr-0";
    case "offsetRight":
      return "mr-[calc(50%-50vw)] ml-0";
    default:
      return "";
  }
}

// Renders a single figure: an image with an optional numbered caption.
// `figureNumber` is passed in as a prop rather than tracked internally.
function PortableImageFigure({
  image,
  figureNumber,
  className,
}: {
  image: PortableImageBlock;
  figureNumber: number | null;
  className?: string;
}) {
  if (!image?.asset) return null;
  const ratio = image.aspectRatio && image.aspectRatio > 0 ? image.aspectRatio : 16 / 9;

  return (
    <figure className={className}>
      <div
        className="relative w-full overflow-hidden rounded-sm border border-black/10 bg-black/5 dark:border-white/10 dark:bg-white/5"
        style={{ aspectRatio: ratio }}
      >
        <Image
          src={urlFor(image.asset).width(1800).fit("max").url()}
          alt={image.alt || image.caption || ""}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 1200px"
        />
      </div>
      {image.caption && (
        <figcaption className="mt-3 text-sm text-black/60 italic dark:text-white/60">
          {figureNumber !== null && (
            <span className="dot-font font-doto text-xs tracking-widest text-black/70 uppercase not-italic dark:text-white/70">
              N&#176;{String(figureNumber).padStart(2, "0")}{" — "}
            </span>
          )}
          {image.caption}
        </figcaption>
      )}
    </figure>
  );
}

// Builds fresh `types.image` / `types.imageRow` PortableText handlers. Call
// this once per render (not memoized/shared across renders) since the
// figure-number counter is closed over as local state that must reset every
// time — only images with a caption get numbered.
export function createPortableImageTypes(): PortableTextComponents["types"] {
  let figureNumber = 0;

  return {
    image: ({ value }: { value: PortableImageBlock }) => {
      if (value.caption) figureNumber += 1;
      return (
        <PortableImageFigure
          image={value}
          figureNumber={value.caption ? figureNumber : null}
          className={`my-8 ${sizeWrapperClass(value.size)}`}
        />
      );
    },
    imageRow: ({ value }: { value: { images: PortableImageBlock[] } }) => (
      <div
        className={`my-8 grid grid-cols-1 gap-6 ${value.images.length >= 3 ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}
      >
        {value.images.map((image) => {
          if (image.caption) figureNumber += 1;
          return (
            <PortableImageFigure
              key={image._key}
              image={image}
              figureNumber={image.caption ? figureNumber : null}
            />
          );
        })}
      </div>
    ),
  };
}
