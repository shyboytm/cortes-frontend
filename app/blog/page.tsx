import { type SanityDocument } from "next-sanity";
import { client } from "@/sanity/client";
import PrimaryNav from "@/components/ui/PrimaryNav";
import PageHeader from "@/components/ui/PageHeader";
import PostList, { type PostListItem } from "@/components/ui/PostList";
import { buttonVariants } from "@/components/ui/button";

const POSTS_QUERY = `*[
  _type == "post"
  && defined(slug.current)
]|order(publishedAt desc){
  _id,
  title,
  slug,
  publishedAt,
  likes
}`;

const options = { next: { revalidate: 30 } };

// Groups posts by the year they were published (falling back to
// "Undated" for anything missing a publish date, which the schema
// shouldn't allow in practice but keeps this safe either way). Posts
// already arrive sorted newest-first from the query, so each year's bucket
// stays in that same order — only the years themselves need sorting.
function groupPostsByYear(posts: PostListItem[]) {
  const buckets = new Map<number | "undated", PostListItem[]>();

  for (const post of posts) {
    const key = post.publishedAt ? new Date(post.publishedAt).getFullYear() : "undated";
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key)!.push(post);
  }

  return Array.from(buckets.entries()).sort(([a], [b]) => {
    if (a === "undated") return 1;
    if (b === "undated") return -1;
    return b - a;
  });
}

export default async function BlogIndexPage() {
  const posts = await client.fetch<SanityDocument[]>(POSTS_QUERY, {}, options);

  const postItems: PostListItem[] = posts.map((post) => ({
    _id: post._id,
    title: post.title,
    slug: post.slug?.current,
    publishedAt: post.publishedAt,
    likes: post.likes,
  }));

  const years = groupPostsByYear(postItems);

  return (
    <div className="pt-32 pb-24">
      <PrimaryNav />

      <div className="px-6">
        <PageHeader title="Blog" subtitle="Sometimes I write about design, hobbies, and other random thoughts." />

        {years.length === 0 ? (
          <p className="text-black/60 dark:text-white/60">No posts yet — write one in Sanity.</p>
        ) : (
          <>
            <nav
              aria-label="Jump to year"
              className="mb-12 flex flex-wrap gap-2 border-b border-black/10 pb-8 dark:border-white/10"
            >
              {years.map(([year]) => (
                <a
                  key={year}
                  href={`#${year}`}
                  className={buttonVariants({ variant: "secondary", size: "sm" })}
                >
                  <span className="inline-block translate-y-[1px]">
                    {year === "undated" ? "Undated" : year}
                  </span>
                </a>
              ))}
            </nav>

            {years.map(([year, yearPosts]) => (
              <div key={year} id={String(year)} className="mb-12 scroll-mt-32">
                <h2 className="dot-font mb-2 font-doto text-xs tracking-widest text-black/40 uppercase dark:text-white/40">
                  / {year === "undated" ? "Undated" : year}
                </h2>
                <PostList posts={yearPosts} />
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
