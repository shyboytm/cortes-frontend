import Link from "next/link";

export interface PostRowProps {
  title: string;
  slug?: string;
  publishedAt?: string;
}

// One blog post's teaser row: title on the left, published date on the
// right, the whole row a link to the post. Renders nothing if the post has
// no slug yet (shouldn't happen in practice, but keeps this safe to reuse
// anywhere post data might be incomplete).
export default function PostRow({ title, slug, publishedAt }: PostRowProps) {
  if (!slug) return null;

  return (
    <li>
      <Link
        href={`/blog/${slug}`}
        className="flex items-center justify-between gap-6 py-6 transition-colors hover:text-black/60 dark:hover:text-white/60"
      >
        <h2 className="text-lg font-normal text-black dark:text-white">{title}</h2>
        {publishedAt && (
          <p className="dot-font font-doto shrink-0 text-xs tracking-widest text-black/40 uppercase dark:text-white/60">
            {new Date(publishedAt).toLocaleDateString()}
          </p>
        )}
      </Link>
    </li>
  );
}
