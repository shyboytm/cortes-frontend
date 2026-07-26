import PostRow from "@/components/ui/PostRow";

export interface PostListItem {
  _id: string;
  title: string;
  slug?: string;
  publishedAt?: string;
  likes?: number;
}

export interface PostListProps {
  posts: PostListItem[];
}

export default function PostList({ posts }: PostListProps) {
  if (posts.length === 0) {
    return <p className="text-black/60 dark:text-white/60">No posts yet — write one in Sanity.</p>;
  }

  return (
    <ul className="divide-y divide-black/10 dark:divide-white/10">
      {posts.map((post) => (
        <PostRow
          key={post._id}
          _id={post._id}
          title={post.title}
          slug={post.slug}
          publishedAt={post.publishedAt}
          likes={post.likes}
        />
      ))}
    </ul>
  );
}
