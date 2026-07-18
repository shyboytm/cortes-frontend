import Image from "next/image";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
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
  size?: "inset" | "half" | "third" | "wide" | "full" | "offsetLeft";
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

// An "offsetLeft" image is never rendered by the plain `image` handler — it
// gets swept up, along with every block that follows it, into an
// "offsetSection" (see groupOffsetSections below) and rendered as a sticky
// left-column figure running alongside that content in a right column.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isOffsetLeftImage(block: any): block is PortableImageBlock {
  return block?._type === "image" && block.size === "offsetLeft";
}

// An "endOffset" block is an author-inserted marker (Sanity object type,
// not an image) with no visual output of its own — it just closes whichever
// offsetSection is currently open, so a pinned image doesn't stay stuck for
// the rest of the document. Without one, an offsetSection only ends when
// the next offsetLeft image starts a new pairing (or the document ends).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isEndOffsetMarker(block: any): boolean {
  return block?._type === "endOffset";
}

// Sweeps every block starting at an "offsetLeft" image up through (but not
// including) whichever comes first — the next "offsetLeft" image or an
// "endOffset" marker — into a single synthetic "offsetSection" block, so it
// can be rendered as one sticky-image + running-text pairing. Content before
// the first offsetLeft image (or when there isn't one at all) passes
// through unchanged; the endOffset marker itself is dropped, not rendered.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function groupOffsetSections(blocks: any[]): any[] {
  const result: any[] = []; // eslint-disable-line @typescript-eslint/no-explicit-any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let currentSection: { _type: "offsetSection"; _key: string; image: PortableImageBlock; content: any[] } | null =
    null;

  for (const block of blocks) {
    if (isOffsetLeftImage(block)) {
      currentSection = { _type: "offsetSection", _key: `${block._key}-offset`, image: block, content: [] };
      result.push(currentSection);
      continue;
    }
    if (isEndOffsetMarker(block)) {
      currentSection = null;
      continue;
    }
    if (currentSection) {
      currentSection.content.push(block);
    } else {
      result.push(block);
    }
  }

  return result;
}

// Runs both grouping passes: half/third pairing first, then offsetLeft
// sweeping (so an imageRow that falls inside an offset section's run of
// content arrives already paired). This is what page components should call
// on a raw Sanity body/caseStudy array before handing it to PortableText.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function prepareImageBlocks(blocks: any[]): any[] {
  return groupOffsetSections(groupAdjacentImages(blocks));
}

// Width treatment per image. "inset" matches the text column, "wide" breaks
// past it a bit, "full" bleeds edge-to-edge, and "half"/"third" are only
// meaningful paired inside an imageRow (a lone one just renders inset).
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

// Builds a complete, fresh set of PortableText components for each render
// (not memoized/shared across renders): the figure-number counter is closed
// over as local state that must reset every time, and only images with a
// caption get numbered. `marks`/`block` are passed in by the page (link
// styling, heading styling, lede paragraph, etc.) and merged in alongside
// the shared image/imageRow/offsetSection handlers below.
//
// offsetSection recurses back into <PortableText> using this same
// components object, so anything nested in an offset section's running text
// column (headings, paragraphs, even further inline images) gets the exact
// same treatment as the top-level body — including continuing the same
// figure-number sequence, since it's the same closure.
export function createPortableTextComponents({
  marks,
  block,
}: {
  marks?: PortableTextComponents["marks"];
  block?: PortableTextComponents["block"];
}): PortableTextComponents {
  let figureNumber = 0;

  const components: PortableTextComponents = {
    marks,
    types: {
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      offsetSection: ({ value }: { value: { image: PortableImageBlock; content: any[] } }) => {
        if (value.image.caption) figureNumber += 1;
        return (
          <div className="my-8 grid grid-cols-1 gap-8 md:grid-cols-[minmax(240px,340px)_1fr] md:items-start">
            <div className="md:sticky md:top-32">
              <PortableImageFigure
                image={value.image}
                figureNumber={value.image.caption ? figureNumber : null}
              />
            </div>
            <div className="min-w-0">
              <PortableText value={value.content} components={components} />
            </div>
          </div>
        );
      },
    },
    block,
  };

  return components;
}
