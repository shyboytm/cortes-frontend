import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { type SanityDocument } from "next-sanity";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import { client } from "@/sanity/client";
import { urlFor } from "@/sanity/image";
import PrimaryNav from "@/components/ui/PrimaryNav";
import PageHeader from "@/components/ui/PageHeader";
import { Button, buttonVariants } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { formatPostDate } from "@/lib/utils";
import LikeButton from "@/components/ui/LikeButton";
import BlogStickyBar from "@/components/ui/BlogStickyBar";

const POST_QUERY = `*[
  _type == "post"
  && slug.current == $slug
][0]{
  _id,
  title,
  publishedAt,
  likes,
  image,
  body[]{
    ...,
    _type == "image" => {
      "aspectRatio": asset->metadata.dimensions.aspectRatio
    }
  }
}`;

const options = { next: { revalidate: 30 } };

type PostImageBlock = {
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
function groupHalfImages(blocks: any[]): any[] {
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
function sizeWrapperClass(size: PostImageBlock["size"]) {
  switch (size) {
    case "full":
      return "mx-[calc(50%-50vw)] w-screen";
    case "wide":
      return "-mx-6 sm:-mx-12 md:-mx-16";
    default:
      return "";
  }
}

// A single figure (image + optional numbered caption). `figureNumber` is
// passed in rather than tracked via module state, since that state has to
// be scoped to one render of one post, not shared across requests.
function PostFigure({
  image,
  figureNumber,
  className,
}: {
  image: PostImageBlock;
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

// Builds a fresh set of PortableText components per render — the figure
// counter and "has the lede already been rendered" flag are closed-over
// local state, so each request/post gets its own count starting at zero
// instead of a module-level counter leaking across concurrent requests.
function createPostComponents(): PortableTextComponents {
  let figureNumber = 0;
  let hasRenderedLede = false;

  return {
    marks: {
      link: ({ value, children }) => {
        const href = value?.href || "#";
        const isExternal = /^https?:\/\//.test(href);
        return (
          <a
            href={href}
            className="link-underline opacity-50"
            {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          >
            {children}
          </a>
        );
      },
    },
    types: {
      image: ({ value }: { value: PostImageBlock }) => {
        if (value.caption) figureNumber += 1;
        return (
          <PostFigure
            image={value}
            figureNumber={value.caption ? figureNumber : null}
            className={`my-8 ${sizeWrapperClass(value.size)}`}
          />
        );
      },
      imageRow: ({ value }: { value: { images: PostImageBlock[] } }) => (
        <div className="my-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {value.images.map((image) => {
            if (image.caption) figureNumber += 1;
            return (
              <PostFigure
                key={image._key}
                image={image}
                figureNumber={image.caption ? figureNumber : null}
              />
            );
          })}
        </div>
      ),
    },
    block: {
      normal: ({ children }) => {
        // The very first paragraph of a post renders as a larger "lede"
        // statement — everything after it is regular body copy.
        if (!hasRenderedLede) {
          hasRenderedLede = true;
          return (
            <p className="my-6 text-2xl leading-relaxed font-light text-black dark:text-white">
              {children}
            </p>
          );
        }
        return <p className="my-4 text-lg leading-relaxed text-black/80 dark:text-white/80">{children}</p>;
      },
      h2: ({ children }) => (
        <h2 className="mt-10 mb-4 text-2xl font-normal tracking-wide text-black dark:text-white">{children}</h2>
      ),
      h3: ({ children }) => (
        <h3 className="mt-8 mb-3 text-xl font-normal tracking-wide text-black dark:text-white">{children}</h3>
      ),
    },
  };
}

export default async function WritingPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await client.fetch<SanityDocument>(POST_QUERY, { slug }, options);

  if (!post) {
    notFound();
  }

  const body = Array.isArray(post.body) ? groupHalfImages(post.body) : [];

  return (
    <div className="pt-32 pb-24">
      <PrimaryNav />
      <BlogStickyBar id={post._id} title={post.title} likes={post.likes ?? 0} />

      <div className="px-6">
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/writing"
            className={buttonVariants({ variant: "secondary", size: "sm" })}
          >
            <ArrowLeft size={18} /> <span className="inline-block translate-y-[1px]">Back</span>
          </Link>

          <LikeButton id={post._id} initialLikes={post.likes ?? 0} />
        </div>

        <PageHeader
          title={post.title}
          subtitle={post.publishedAt ? formatPostDate(post.publishedAt) : undefined}
          className="mt-6"
        />
        {/* Marks where the real title ends — BlogStickyBar watches this via
            IntersectionObserver and reveals itself once it scrolls out of
            view, rather than tracking a hardcoded scroll offset. */}
        <div id="post-title-sentinel" />
      </div>

      <div className="m-auto w-full max-w-3xl px-6 md:px-10">

        {post.image && (
          <div
            className="relative mb-10 w-full overflow-hidden rounded-sm border border-black/10 bg-black/5 dark:border-white/10 dark:bg-white/5"
            style={{ aspectRatio: 16 / 9 }}
          >
            <Image
              src={urlFor(post.image).width(1600).fit("max").url()}
              alt={post.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 800px"
            />
          </div>
        )}

        {body.length > 0 ? (
          <PortableText value={body} components={createPostComponents()} />
        ) : (
          <p className="text-black/60 dark:text-white/60">This post has no content yet.</p>
        )}
      </div>
    </div>
  );
}
