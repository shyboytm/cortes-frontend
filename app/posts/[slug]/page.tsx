import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { type SanityDocument } from "next-sanity";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import { client } from "@/sanity/client";
import { urlFor } from "@/sanity/image";
import PrimaryNav from "@/components/ui/PrimaryNav";

const POST_QUERY = `*[
  _type == "post"
  && slug.current == $slug
][0]{
  _id,
  title,
  publishedAt,
  image,
  body
}`;

const options = { next: { revalidate: 30 } };

// Same typography treatment as the work case-study page — plain-text body
// blocks only for now, since the post schema doesn't support inline images.
const postComponents: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p className="my-4 text-lg leading-relaxed text-black/80 dark:text-white/80">{children}</p>
    ),
    h2: ({ children }) => (
      <h2 className="mt-10 mb-4 text-2xl font-normal text-black dark:text-white">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="mt-8 mb-3 text-xl font-normal text-black dark:text-white">{children}</h3>
    ),
  },
};

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await client.fetch<SanityDocument>(POST_QUERY, { slug }, options);

  if (!post) {
    notFound();
  }

  return (
    <div className="pt-32 pb-24">
      <PrimaryNav />

      <div className="m-auto w-full max-w-3xl px-6 md:px-10">
        <Link
          href="/#posts"
          className="text-sm tracking-widest text-black/50 uppercase transition-colors hover:text-black dark:text-white/50 dark:hover:text-white"
        >
          ← Back
        </Link>

        <div className="mt-6 mb-10 flex flex-col gap-1">
          <h1 className="text-4xl font-normal text-black md:text-5xl dark:text-white">
            {post.title}
          </h1>
          {post.publishedAt && (
            <p className="dot-font font-doto text-sm tracking-widest text-black/40 uppercase dark:text-white/80">
              {new Date(post.publishedAt).toLocaleDateString()}
            </p>
          )}
        </div>

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

        {Array.isArray(post.body) && post.body.length > 0 ? (
          <PortableText value={post.body} components={postComponents} />
        ) : (
          <p className="text-black/60 dark:text-white/60">This post has no content yet.</p>
        )}
      </div>
    </div>
  );
}
