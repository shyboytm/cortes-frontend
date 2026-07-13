import Link from "next/link";
import { type SanityDocument } from "next-sanity";
import { client } from "@/sanity/client";
import PrimaryNav from "@/components/ui/PrimaryNav";

const POSTS_QUERY = `*[
  _type == "post"
  && defined(slug.current)
]|order(publishedAt desc){_id, title, slug, publishedAt}`;

const options = { next: { revalidate: 30 } };

export default async function PostsIndexPage() {
  const posts = await client.fetch<SanityDocument[]>(POSTS_QUERY, {}, options);

  return (
    <div className="pt-32 pb-24">
      <PrimaryNav />

      <div className="px-12">
        <div className="flex flex-col items-start gap-2 pb-10">
          <h1 className="text-4xl font-normal text-black md:text-5xl dark:text-white">Feed</h1>
          <h2 className="dot-font font-doto text-sm tracking-widest text-black/40 uppercase dark:text-white/80">
            Software Product Designer
          </h2>
        </div>

        <ul className="divide-y divide-black/10 dark:divide-white/10">
          {posts.map((post) => (
            <li key={post._id}>
              <Link
                href={`/posts/${post.slug.current}`}
                className="flex items-center justify-between gap-6 py-6 transition-colors hover:text-black/60 dark:hover:text-white/60"
              >
                <h2 className="text-lg font-normal text-black dark:text-white">{post.title}</h2>
                <p className="dot-font font-doto shrink-0 text-xs tracking-widest text-black/40 uppercase dark:text-white/60">
                  {new Date(post.publishedAt).toLocaleDateString()}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
