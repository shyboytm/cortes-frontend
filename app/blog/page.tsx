import { type SanityDocument } from "next-sanity";
import { client } from "@/sanity/client";
import PrimaryNav from "@/components/ui/PrimaryNav";
import PageHeader from "@/components/ui/PageHeader";
import PostList from "@/components/ui/PostList";

const POSTS_QUERY = `*[
  _type == "post"
  && defined(slug.current)
]|order(publishedAt desc){
  _id,
  title,
  slug,
  publishedAt
}`;

const options = { next: { revalidate: 30 } };

export default async function BlogIndexPage() {
  const posts = await client.fetch<SanityDocument[]>(POSTS_QUERY, {}, options);

  return (
    <div className="pt-32 pb-24">
      <PrimaryNav />

      <div className="px-6">
        <PageHeader title="Blog" subtitle="Software Product Designer" />

        <PostList
          posts={posts.map((post) => ({
            _id: post._id,
            title: post.title,
            slug: post.slug?.current,
            publishedAt: post.publishedAt,
          }))}
        />
      </div>
    </div>
  );
}
