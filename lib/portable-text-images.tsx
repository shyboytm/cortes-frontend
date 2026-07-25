import Image from "next/image";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import { urlFor } from "@/sanity/image";
import { resolveVideoEmbed } from "@/lib/video-embed";

// Shared image/video-handling for Sanity PortableText bodies (blog posts,
// work case studies). Both schemas define the same `caption` / `size`
// fields on their body images, uploaded videos, and video embeds (images
// additionally have `alt`), so the width treatment, numbered captions, and
// half-width pairing behave identically across all three media types and
// both content types.
export type PortableMediaSize = "inset" | "half" | "third" | "wide" | "full" | "offsetLeft";

export type PortableImageBlock = {
  _type: "image";
  _key: string;
  alt?: string;
  caption?: string;
  size?: PortableMediaSize;
  aspectRatio?: number | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  asset?: any;
};

export type PortableVideoBlock = {
  _type: "video";
  _key: string;
  caption?: string;
  size?: PortableMediaSize;
  // Resolved by the page's GROQ query (`asset->url`/`asset->mimeType`), not
  // the raw Sanity file-asset reference — see POST_QUERY's `_type == "video"`
  // projection arm.
  url?: string;
  mimeType?: string;
};

export type PortableVideoEmbedBlock = {
  _type: "videoEmbed";
  _key: string;
  caption?: string;
  size?: PortableMediaSize;
  url?: string;
};

export type PortableMediaBlock = PortableImageBlock | PortableVideoBlock | PortableVideoEmbedBlock;

function isMediaBlock(block: unknown): block is PortableMediaBlock {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const type = (block as any)?._type;
  return type === "image" || type === "video" || type === "videoEmbed";
}

// "half" and "third" images/videos pair up with however many more media
// blocks of the same size immediately follow them (1 more for half, 2 more
// for third), grouped into a single synthetic "imageRow" block so they
// render side by side instead of stacked — images and videos can pair with
// each other, since it's the shared `size` field that matters, not the
// media type. A run that comes up short (e.g. a lone "half" or two "third"s
// in a row with nothing left to pair with) just falls through and renders
// each one on its own at inset width.
const GROUP_SIZES: Partial<Record<PortableMediaSize, number>> = {
  half: 2,
  third: 3,
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function groupAdjacentImages(blocks: any[]): any[] {
  const result: any[] = []; // eslint-disable-line @typescript-eslint/no-explicit-any
  let i = 0;
  while (i < blocks.length) {
    const block = blocks[i];
    const groupSize = isMediaBlock(block) && block.size ? GROUP_SIZES[block.size] : undefined;

    if (groupSize) {
      const group = [block];
      let j = i + 1;
      while (group.length < groupSize && isMediaBlock(blocks[j]) && blocks[j].size === block.size) {
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

// An "offsetLeft" image/video is never rendered by the plain `image`/`video`
// handler — it gets swept up, along with every block that follows it, into
// an "offsetSection" (see groupOffsetSections below) and rendered as a
// sticky left-column figure running alongside that content in a right
// column.
function isOffsetLeftMedia(block: unknown): block is PortableMediaBlock {
  return isMediaBlock(block) && block.size === "offsetLeft";
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

// Sweeps every block starting at an "offsetLeft" image/video up through (but
// not including) whichever comes first — the next "offsetLeft" media block
// or an "endOffset" marker — into a single synthetic "offsetSection" block,
// so it can be rendered as one sticky-media + running-text pairing. Content
// before the first offsetLeft media block (or when there isn't one at all)
// passes through unchanged; the endOffset marker itself is dropped, not
// rendered.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function groupOffsetSections(blocks: any[]): any[] {
  const result: any[] = []; // eslint-disable-line @typescript-eslint/no-explicit-any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let currentSection: { _type: "offsetSection"; _key: string; media: PortableMediaBlock; content: any[] } | null =
    null;

  for (const block of blocks) {
    if (isOffsetLeftMedia(block)) {
      currentSection = { _type: "offsetSection", _key: `${block._key}-offset`, media: block, content: [] };
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

// Types that already carry their own generous vertical margin (my-8) —
// used by annotateTextSpacing below to detect when a text block sits
// directly against an image or video, so it can widen its own margin on
// that side rather than crowding against it.
const IMAGE_LIKE_TYPES = new Set(["image", "video", "videoEmbed", "imageRow", "offsetSection"]);

// Walks the array and, for every plain text block (_type: "block" — this
// covers paragraphs and every heading level, since Sanity/Portable Text
// gives them all the same _type and differentiates only by `style`), tags
// it with `_spacingTop`/`_spacingBottom` flags when the adjacent sibling is
// an image/imageRow/offsetSection. Recurses into an offsetSection's own
// `content` array too, since that's rendered as its own independent
// PortableText sequence with its own adjacency. Consumed by
// textSpacingClassName in each block/heading renderer.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function annotateTextSpacing(blocks: any[]): any[] {
  return blocks.map((block, index) => {
    if (block?._type === "offsetSection") {
      return { ...block, content: annotateTextSpacing(block.content) };
    }
    if (block?._type !== "block") return block;
    return {
      ...block,
      _spacingTop: IMAGE_LIKE_TYPES.has(blocks[index - 1]?._type),
      _spacingBottom: IMAGE_LIKE_TYPES.has(blocks[index + 1]?._type),
    };
  });
}

// Extra margin a paragraph/heading gets on whichever edge(s) sit directly
// against an image, instead of its usual default margin on that edge —
// roughly 4x the image's own my-8 gap on desktop, scaling down a bit on
// tablet and mobile so it doesn't feel as exaggerated on smaller screens.
// (8px less than the initial pass at each breakpoint: 64/96/128 -> 56/88/120.)
const EXTRA_SPACING_TOP = "mt-[56px] sm:mt-[88px] lg:mt-[120px]";
const EXTRA_SPACING_BOTTOM = "mb-[56px] sm:mb-[88px] lg:mb-[120px]";

// Builds a block/heading's margin classes: `defaultTop`/`defaultBottom` are
// used normally, swapped out for the wider EXTRA_SPACING_* classes on
// whichever edge(s) annotateTextSpacing flagged as sitting against an image.
export function textSpacingClassName(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: { _spacingTop?: boolean; _spacingBottom?: boolean } | any,
  defaultTop: string,
  defaultBottom: string
): string {
  const top = value?._spacingTop ? EXTRA_SPACING_TOP : defaultTop;
  const bottom = value?._spacingBottom ? EXTRA_SPACING_BOTTOM : defaultBottom;
  return `${top} ${bottom}`;
}

// Runs every grouping/annotation pass: half/third pairing, then offsetLeft
// sweeping (so an imageRow that falls inside an offset section's run of
// content arrives already paired), then image-adjacency spacing. This is
// what page components should call on a raw Sanity body/caseStudy array
// before handing it to PortableText.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function prepareImageBlocks(blocks: any[]): any[] {
  return annotateTextSpacing(groupOffsetSections(groupAdjacentImages(blocks)));
}

// Width treatment per image/video. "inset" matches the text column, "wide"
// breaks past it a bit, "full" bleeds edge-to-edge, and "half"/"third" are
// only meaningful paired inside an imageRow (a lone one just renders inset).
function sizeWrapperClass(size: PortableMediaSize | undefined) {
  switch (size) {
    case "full":
      return "mx-[calc(50%-50vw)] w-screen";
    case "wide":
      return "-mx-6 sm:-mx-12 md:-mx-16";
    default:
      return "";
  }
}

// Shared caption markup so the image and video figures render an identical
// numbered-caption treatment.
function MediaCaption({ caption, figureNumber }: { caption?: string; figureNumber: number | null }) {
  if (!caption) return null;
  return (
    <figcaption className="font-space-mono mt-3 text-sm text-black/60 italic dark:text-white/60">
      {figureNumber !== null && (
        <span className="dot-font font-doto text-xs tracking-widest text-black/70 uppercase not-italic dark:text-white/70">
          N&#176;{String(figureNumber).padStart(2, "0")}{" — "}
        </span>
      )}
      {caption}
    </figcaption>
  );
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
      <MediaCaption caption={image.caption} figureNumber={figureNumber} />
    </figure>
  );
}

// Renders a single video figure with native controls. Unlike images, videos
// aren't cropped to a fixed aspect ratio (no `fill`/`object-cover`) — the
// <video> element just sizes itself to its own natural dimensions at full
// width, since forcing/cropping a video's frame is far more noticeable and
// unwanted than it is for a photo.
function PortableVideoFigure({
  video,
  figureNumber,
  className,
}: {
  video: PortableVideoBlock;
  figureNumber: number | null;
  className?: string;
}) {
  if (!video?.url) return null;

  return (
    <figure className={className}>
      <video
        src={video.url}
        controls
        playsInline
        className="w-full rounded-sm border border-black/10 bg-black/5 dark:border-white/10 dark:bg-white/5"
      >
        Your browser doesn&apos;t support embedded video.
      </video>
      <MediaCaption caption={video.caption} figureNumber={figureNumber} />
    </figure>
  );
}

// Renders a YouTube/Vimeo link as a responsive embedded player (16:9 — the
// standard aspect ratio for both platforms' default embeds, since neither
// exposes the source video's real dimensions the way a Sanity image asset
// does). Falls back to a plain "Watch video" link for any URL
// resolveVideoEmbed can't parse, rather than pointing an iframe at a page
// that will refuse to render inside one.
function PortableVideoEmbedFigure({
  embed,
  figureNumber,
  className,
}: {
  embed: PortableVideoEmbedBlock;
  figureNumber: number | null;
  className?: string;
}) {
  if (!embed?.url) return null;
  const resolved = resolveVideoEmbed(embed.url);

  return (
    <figure className={className}>
      {resolved ? (
        <div
          className="relative w-full overflow-hidden rounded-sm border border-black/10 bg-black/5 dark:border-white/10 dark:bg-white/5"
          style={{ aspectRatio: 16 / 9 }}
        >
          <iframe
            src={resolved.embedUrl}
            title={embed.caption || "Embedded video"}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="absolute inset-0 h-full w-full"
          />
        </div>
      ) : (
        <a
          href={embed.url}
          target="_blank"
          rel="noopener noreferrer"
          className="link-underline block text-black underline underline-offset-4 dark:text-white"
        >
          Watch video ↗
        </a>
      )}
      <MediaCaption caption={embed.caption} figureNumber={figureNumber} />
    </figure>
  );
}

// Picks the right figure renderer for a media block by `_type`, shared by
// the top-level image/video/videoEmbed handlers, imageRow (which can mix
// any of the three of the same size), and offsetSection.
function MediaFigure({
  media,
  figureNumber,
  className,
}: {
  media: PortableMediaBlock;
  figureNumber: number | null;
  className?: string;
}) {
  if (media._type === "video") {
    return <PortableVideoFigure video={media} figureNumber={figureNumber} className={className} />;
  }
  if (media._type === "videoEmbed") {
    return <PortableVideoEmbedFigure embed={media} figureNumber={figureNumber} className={className} />;
  }
  return <PortableImageFigure image={media} figureNumber={figureNumber} className={className} />;
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
      video: ({ value }: { value: PortableVideoBlock }) => {
        if (value.caption) figureNumber += 1;
        return (
          <PortableVideoFigure
            video={value}
            figureNumber={value.caption ? figureNumber : null}
            className={`my-8 ${sizeWrapperClass(value.size)}`}
          />
        );
      },
      videoEmbed: ({ value }: { value: PortableVideoEmbedBlock }) => {
        if (value.caption) figureNumber += 1;
        return (
          <PortableVideoEmbedFigure
            embed={value}
            figureNumber={value.caption ? figureNumber : null}
            className={`my-8 ${sizeWrapperClass(value.size)}`}
          />
        );
      },
      imageRow: ({ value }: { value: { images: PortableMediaBlock[] } }) => (
        // Same viewport-breakout + max-w-6xl re-center as offsetSection
        // below: a paired row had no width of its own before this, so a
        // 2-across or 3-across grid was squeezed down to the blog page's
        // narrow max-w-3xl reading column (each image far smaller than a
        // "half"/"third" is supposed to be) while looking fine on the work
        // page's much wider max-w-7xl wrapper. This gives both pages the
        // same effective row width regardless of the ambient container.
        <div className="mx-[calc(50%-50vw)] my-8 w-screen px-6 sm:px-12 md:px-16">
          <div
            className={`mx-auto grid max-w-6xl grid-cols-1 gap-6 ${value.images.length >= 3 ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}
          >
            {value.images.map((media) => {
              if (media.caption) figureNumber += 1;
              return (
                <MediaFigure
                  key={media._key}
                  media={media}
                  figureNumber={media.caption ? figureNumber : null}
                />
              );
            })}
          </div>
        </div>
      ),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      offsetSection: ({ value }: { value: { media: PortableMediaBlock; content: any[] } }) => {
        if (value.media.caption) figureNumber += 1;
        return (
          // Breaks out of whatever reading-width column the page wraps its
          // body in (max-w-3xl on blog posts, max-w-7xl on work case
          // studies) using the same "escape to the viewport, then re-center"
          // trick a "full"-sized image uses (mx-[calc(50%-50vw)] w-screen),
          // but with its own max-width and side padding restored afterward
          // instead of bleeding edge-to-edge, since this holds running body
          // text rather than a single image. Without this, the sticky
          // image + text pairing was at the mercy of whatever width the
          // ambient page container happened to leave over — plenty of room
          // on the work page's wide max-w-7xl wrapper, but squeezed into a
          // cramped sliver on the blog page's narrower max-w-3xl one.
          // max-w-6xl is sized so the running-text column comes out at the
          // same effective width either way: wide enough that the
          // paragraph/heading's own `max-w-3xl` (see block.normal below) is
          // what actually caps its width, not this outer grid.
          <div className="mx-[calc(50%-50vw)] my-8 w-screen px-6 sm:px-12 md:px-16">
            <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-[minmax(240px,340px)_1fr] md:items-start">
              <div className="md:sticky md:top-32">
                <MediaFigure
                  media={value.media}
                  figureNumber={value.media.caption ? figureNumber : null}
                />
              </div>
              {/* [&>*:first-child]:mt-0 zeroes whatever top margin the first
                  rendered block would otherwise have (a paragraph's mt-4, a
                  heading's mt-8, etc.) so it starts flush with the sticky
                  image beside it instead of sitting visibly lower. */}
              <div className="min-w-0 [&>*:first-child]:mt-0">
                <PortableText value={value.content} components={components} />
              </div>
            </div>
          </div>
        );
      },
    },
    block,
  };

  return components;
}
