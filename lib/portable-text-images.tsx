import Image from "next/image";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import type { SanityImageSource } from "@sanity/image-url";
import { urlFor } from "@/sanity/image";
import { resolveVideoEmbed } from "@/lib/video-embed";
import { highlightCode } from "@/lib/code-highlight";
import ImageCarousel from "@/components/ui/ImageCarousel";

export type PortableMediaSize = "inset" | "half" | "third" | "wide" | "full" | "offsetLeft";

export type PortableImageRatio = "original" | "1:1" | "4:3" | "3:2" | "16:9" | "9:16";

export type PortableImageBlock = {
  _type: "image";
  _key: string;
  alt?: string;
  caption?: string;
  size?: PortableMediaSize;
  ratio?: PortableImageRatio;
  aspectRatio?: number | null;
  asset?: SanityImageSource;
};

export type PortableVideoBlock = {
  _type: "video";
  _key: string;
  caption?: string;
  size?: PortableMediaSize;
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

export type PortableCodeBlock = {
  _type: "code";
  _key: string;
  code?: string;
  language?: string;
  filename?: string;
  _highlightedHtml?: string;
};

export type PortableImageCarouselBlock = {
  _type: "imageCarousel";
  _key: string;
  images?: PortableImageBlock[];
};

export type PortableDividerBlock = {
  _type: "divider";
  _key: string;
};

export type PortableMediaBlock = PortableImageBlock | PortableVideoBlock | PortableVideoEmbedBlock;

type PortableRawBlock = { _type: string; _key: string } & Record<string, unknown>;

function isMediaBlock(block: unknown): block is PortableMediaBlock {
  const type = (block as { _type?: unknown })?._type;
  return type === "image" || type === "video" || type === "videoEmbed";
}

const GROUP_SIZES: Partial<Record<PortableMediaSize, number>> = {
  half: 2,
  third: 3,
};

export function groupAdjacentImages(blocks: PortableRawBlock[]): PortableRawBlock[] {
  const result: PortableRawBlock[] = [];
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

function isOffsetLeftMedia(block: unknown): block is PortableMediaBlock {
  return isMediaBlock(block) && block.size === "offsetLeft";
}

function isEndOffsetMarker(block: PortableRawBlock): boolean {
  return block._type === "endOffset";
}

export function groupOffsetSections(blocks: PortableRawBlock[]): PortableRawBlock[] {
  const result: PortableRawBlock[] = [];
  let currentSection: {
    _type: "offsetSection";
    _key: string;
    media: PortableMediaBlock;
    content: PortableRawBlock[];
  } | null = null;

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

const IMAGE_LIKE_TYPES = new Set([
  "image",
  "video",
  "videoEmbed",
  "imageRow",
  "offsetSection",
  "code",
  "imageCarousel",
  "divider",
]);

function annotateTextSpacing(blocks: PortableRawBlock[]): PortableRawBlock[] {
  return blocks.map((block, index) => {
    if (block._type === "offsetSection") {
      return { ...block, content: annotateTextSpacing(block.content as PortableRawBlock[]) };
    }
    if (block._type !== "block") return block;
    return {
      ...block,
      _spacingTop: IMAGE_LIKE_TYPES.has(blocks[index - 1]?._type),
      _spacingBottom: IMAGE_LIKE_TYPES.has(blocks[index + 1]?._type),
    };
  });
}

const EXTRA_SPACING_TOP = "mt-[56px] sm:mt-[88px] lg:mt-[120px]";
const EXTRA_SPACING_BOTTOM = "mb-[56px] sm:mb-[88px] lg:mb-[120px]";

export function textSpacingClassName(value: unknown, defaultTop: string, defaultBottom: string): string {
  const spacing = value as { _spacingTop?: boolean; _spacingBottom?: boolean } | null | undefined;
  const top = spacing?._spacingTop ? EXTRA_SPACING_TOP : defaultTop;
  const bottom = spacing?._spacingBottom ? EXTRA_SPACING_BOTTOM : defaultBottom;
  return `${top} ${bottom}`;
}

async function highlightCodeBlocks(blocks: PortableRawBlock[]): Promise<PortableRawBlock[]> {
  return Promise.all(
    blocks.map(async (block) => {
      if (block._type === "code") {
        const code = typeof block.code === "string" ? block.code : "";
        if (!code) return block;
        const language = typeof block.language === "string" ? block.language : undefined;
        const _highlightedHtml = await highlightCode(code, language);
        return { ...block, _highlightedHtml };
      }
      if (block._type === "offsetSection") {
        const content = await highlightCodeBlocks(block.content as PortableRawBlock[]);
        return { ...block, content };
      }
      return block;
    })
  );
}

export async function prepareImageBlocks(blocks: PortableRawBlock[]): Promise<PortableRawBlock[]> {
  const grouped = annotateTextSpacing(groupOffsetSections(groupAdjacentImages(blocks)));
  return highlightCodeBlocks(grouped);
}

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

const FIXED_IMAGE_RATIOS: Record<Exclude<PortableImageRatio, "original">, number> = {
  "1:1": 1,
  "4:3": 4 / 3,
  "3:2": 3 / 2,
  "16:9": 16 / 9,
  "9:16": 9 / 16,
};

function resolveImageRatio(image: PortableImageBlock): number {
  if (image.ratio && image.ratio !== "original") {
    return FIXED_IMAGE_RATIOS[image.ratio];
  }
  return image.aspectRatio && image.aspectRatio > 0 ? image.aspectRatio : 16 / 9;
}

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
  const ratio = resolveImageRatio(image);

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
          data-cuelume-hover="tick"
          data-cuelume-press
          className="link-underline block text-black underline underline-offset-4 dark:text-white"
        >
          Watch video ↗
        </a>
      )}
      <MediaCaption caption={embed.caption} figureNumber={figureNumber} />
    </figure>
  );
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function CodeBlockFigure({ value, className }: { value: PortableCodeBlock; className?: string }) {
  if (!value?.code) return null;
  const label = value.filename || value.language;

  return (
    <figure className={className}>
      <div className="overflow-hidden rounded-sm border border-black/10 dark:border-white/10">
        {label && (
          <div className="flex items-center justify-between gap-3 border-b border-black/10 bg-black/5 px-4 py-2 dark:border-white/10 dark:bg-white/5">
            <span className="font-mono text-xs text-black/60 dark:text-white/60">{label}</span>
            {value.filename && value.language && (
              <span className="dot-font font-doto text-[10px] tracking-widest text-black/40 uppercase dark:text-white/40">
                {value.language}
              </span>
            )}
          </div>
        )}
        <div
          className="font-mono text-sm leading-relaxed"
          dangerouslySetInnerHTML={{
            __html: value._highlightedHtml || `<pre class="shiki"><code>${escapeHtml(value.code)}</code></pre>`,
          }}
        />
      </div>
    </figure>
  );
}

function ImageCarouselFigure({ value }: { value: PortableImageCarouselBlock }) {
  const slides = (value.images ?? [])
    .filter((image) => image?.asset)
    .map((image, index) => ({
      key: image._key || String(index),
      src: urlFor(image.asset!).width(2400).fit("max").url(),
      alt: image.alt || image.caption || "",
      caption: image.caption,
    }));

  if (slides.length === 0) return null;

  return (
    <div className={`my-8 ${sizeWrapperClass("wide")}`}>
      <ImageCarousel slides={slides} />
    </div>
  );
}

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
    list: {
      bullet: ({ children }) => (
        <ul className="mx-auto mt-4 mb-4 max-w-3xl list-disc space-y-2 pl-6 marker:text-black/30 dark:marker:text-white/30">
          {children}
        </ul>
      ),
      number: ({ children }) => (
        <ol className="mx-auto mt-4 mb-4 max-w-3xl list-decimal space-y-2 pl-6 marker:font-medium marker:text-black/50 dark:marker:text-white/50">
          {children}
        </ol>
      ),
    },
    listItem: {
      bullet: ({ children }) => (
        <li className="text-lg leading-relaxed text-black/80 pl-1.5 marker:text-black/30 dark:text-white/80 dark:marker:text-white/30">
          {children}
        </li>
      ),
      number: ({ children }) => (
        <li className="text-lg leading-relaxed text-black/80 pl-1.5 dark:text-white/80">{children}</li>
      ),
    },
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
      code: ({ value }: { value: PortableCodeBlock }) => (
        <CodeBlockFigure value={value} className="my-8" />
      ),
      imageCarousel: ({ value }: { value: PortableImageCarouselBlock }) => (
        <ImageCarouselFigure value={value} />
      ),
      divider: () => (
        <hr className="my-12 mx-auto max-w-3xl border-t border-black/10 dark:border-white/10" />
      ),
      imageRow: ({ value }: { value: { images: PortableMediaBlock[] } }) => (
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
      offsetSection: ({ value }: { value: { media: PortableMediaBlock; content: PortableRawBlock[] } }) => {
        if (value.media.caption) figureNumber += 1;
        return (
          <div className="mx-[calc(50%-50vw)] my-8 w-screen px-6 sm:px-12 md:px-16">
            <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-[minmax(240px,340px)_1fr] md:items-start">
              <div className="md:sticky md:top-32">
                <MediaFigure
                  media={value.media}
                  figureNumber={value.media.caption ? figureNumber : null}
                />
              </div>
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
