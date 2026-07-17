import { type SanityDocument } from "next-sanity";
import { client, sanityFetchOptions } from "@/sanity/client";
import PrimaryNav from "@/components/ui/PrimaryNav";
import PageHeader from "@/components/ui/PageHeader";
import PostList, { type PostListItem } from "@/components/ui/PostList";
import JumpNav from "@/components/ui/JumpNav";
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

const options = sanityFetchOptions(30);

// Groups posts by the year they were published, falling back to "Undated"
// for posts with no publish date. Posts arrive sorted newest-first from the
// query, so only the year buckets need sorting, not the posts within them.
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

export default async function WritingIndexPage() {
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
        <PageHeader title="Writing" subtitle="Sometimes I write about design, hobbies, and other random thoughts." />

        {years.length === 0 ? (
          <p className="text-black/60 dark:text-white/60">No posts yet — write one in Sanity.</p>
        ) : (
          <>
            <JumpNav
              ariaLabel="Jump to year"
              sentinelId="writing-nav-sentinel"
              items={years.map(([year]) => (
                <a
                  key={year}
                  href={`#${year}`}
                  className={buttonVariants({ variant: "secondary", size: "sm" })}
                >
                  {year === "undated" ? "Undated" : year}
                </a>
              ))}
            />

            {years.map(([year, yearPosts]) => (
              <div key={year} id={String(year)} className="mb-12 scroll-mt-32">
                <h2 className="dot-font mb-2 font-doto text-xs tracking-widest text-black/60 uppercase dark:text-white/60">
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
