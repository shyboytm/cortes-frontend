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
  size?: "inset" | "half" | "wide" | "full";
  aspectRatio?: number | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  asset?: any;
};

// Adjacent images both marked "half" get paired up into a single synthetic
// "imageRow" block so they render side-by-side instead of stacked — a lone
// half-width image (nothing to pair with) just falls through and renders
// on its own.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function groupHalfImages(blocks: any[]): any[] {
  const result: any[] = []; // eslint-disable-line @typescript-eslint/no-explicit-any
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    const next = blocks[i + 1];
    if (block?._type === "image" && block.size === "half" && next?._type === "image" && next.size === "half") {
      result.push({ _type: "imageRow", _key: `${block._key}-row`, images: [block, next] });
      i += 1;
    } else {
      result.push(block);
    }
  }
  return result;
}

// Width treatment per image: "inset" matches the text column, "wide" breaks
// past it a bit, "full" bleeds edge-to-edge, and "half" is only meaningful
// paired inside an imageRow (a lone one just renders inset).
function sizeWrapperClass(size: PortableImageBlock["size"]) {
  switch (size) {
    case "full":
      return "mx-[calc(50%-50vw)] w-screen";
    case "wide":
      return "-mx-6 sm:-mx-12 md:-mx-16";
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
      <div className="my-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
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
