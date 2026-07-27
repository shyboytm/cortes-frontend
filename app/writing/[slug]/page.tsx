import Image from "next/image";
import { cache } from "react";
import type { Metadata } from "next";
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
import ShareButtons from "@/components/ui/ShareButtons";
import DetailStickyBar from "@/components/ui/DetailStickyBar";
import { portableTextLinkMark, portableTextHeadings } from "@/lib/portable-text-marks";
import { prepareImageBlocks, createPortableTextComponents, textSpacingClassName } from "@/lib/portable-text-images";
import { portableTextToPlainText } from "@/lib/portable-text-to-plain";
import { buildMetadata } from "@/lib/page-meta";
import { DEFAULT_OG_IMAGE, SITE_URL } from "@/lib/site-config";

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
    },
    _type == "video" => {
      "url": asset->url,
      "mimeType": asset->mimeType
    }
  }
}`;

const options = sanityFetchOptions(30);

const getPost = cache(async (slug: string) => {
  return client.fetch<SanityDocument>(POST_QUERY, { slug }, options);
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};

  const description =
    portableTextToPlainText(post.body, 160) || "Sometimes I write about design, hobbies, and other random thoughts.";
  const imageUrl = post.image ? urlFor(post.image).width(1200).height(630).fit("crop").url() : DEFAULT_OG_IMAGE;

  return buildMetadata({
    title: post.title,
    description,
    imageUrl,
    path: `/writing/${slug}`,
    type: "article",
  });
}

function createPostComponents(): PortableTextComponents {
  let hasRenderedLede = false;

  return createPortableTextComponents({
    marks: {
      link: portableTextLinkMark,
    },
    block: {
      normal: ({ children, value }) => {
        if (!hasRenderedLede) {
          hasRenderedLede = true;
          return (
            <p
              className={`mx-auto max-w-3xl text-2xl leading-relaxed font-light text-black dark:text-white ${textSpacingClassName(value, "mt-6", "mb-6")}`}
            >
              {children}
            </p>
          );
        }
        return (
          <p
            className={`mx-auto max-w-3xl text-lg leading-relaxed text-black/80 dark:text-white/80 ${textSpacingClassName(value, "mt-4", "mb-4")}`}
          >
            {children}
          </p>
        );
      },
      ...portableTextHeadings,
    },
  });
}

export default async function WritingPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    notFound();
  }

  const body = Array.isArray(post.body) ? await prepareImageBlocks(post.body) : [];
  const shareUrl = `${SITE_URL}/writing/${slug}`;

  return (
    <div className="pt-32 pb-24">
      <PrimaryNav />
      <DetailStickyBar
        id={post._id}
        title={post.title}
        likes={post.likes ?? 0}
        backHref="/writing"
        sentinelId="post-title-sentinel"
        shareUrl={shareUrl}
      />

      <div className="px-6">
        <div className="flex items-center justify-between gap-4">
          <BackLink href="/writing" iconSize={18} />

          <div className="flex items-center gap-7">
            <ShareButtons url={shareUrl} title={post.title} className="hidden sm:flex" />
            <LikeButton id={post._id} initialLikes={post.likes ?? 0} />
          </div>
        </div>

        <PageHeader
          title={post.title}
          subtitle={post.publishedAt ? formatPostDate(post.publishedAt) : undefined}
          className="mt-6"
        />
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
