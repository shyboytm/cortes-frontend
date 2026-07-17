import Image from "next/image";
import { notFound } from "next/navigation";
import { type SanityDocument } from "next-sanity";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import { client, sanityFetchOptions } from "@/sanity/client";
import { urlFor } from "@/sanity/image";
import PrimaryNav from "@/components/ui/PrimaryNav";
import PageHeader from "@/components/ui/PageHeader";
import { BackLink } from "@/components/ui/LinkPill";
import { formatPostDate } from "@/lib/utils";
import LikeButton from "@/components/ui/LikeButton";
import BlogStickyBar from "@/components/ui/BlogStickyBar";
import { portableTextLinkMark, portableTextHeadings } from "@/lib/portable-text-marks";
import { groupHalfImages, createPortableImageTypes } from "@/lib/portable-text-images";

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

const options = sanityFetchOptions(30);

// Creates a new set of PortableText components for each render. The figure
// counter (inside createPortableImageTypes) and "has the lede been
// rendered" flag are local state closed over by the returned components.
function createPostComponents(): PortableTextComponents {
  let hasRenderedLede = false;

  return {
    marks: {
      link: portableTextLinkMark,
    },
    types: createPortableImageTypes(),
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
      ...portableTextHeadings,
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
          <BackLink href="/writing" iconSize={18} />

          <LikeButton id={post._id} initialLikes={post.likes ?? 0} />
        </div>

        <PageHeader
          title={post.title}
          subtitle={post.publishedAt ? formatPostDate(post.publishedAt) : undefined}
          className="mt-6"
        />
        {/* Marks where the title ends; BlogStickyBar watches this via
            IntersectionObserver and reveals itself once it scrolls out of view. */}
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
