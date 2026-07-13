import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { formatPostDate } from "@/lib/utils";

export interface PostRowProps {
  title: string;
  slug?: string;
  publishedAt?: string;
}

// One blog post's teaser row: title on the left, published date on the
// right, the whole row a link to the post. A subtle background tint plus a
// sliding arrow (same affordance WorkRow uses) signal it's clickable on
// hover. Renders nothing if the post has no slug yet (shouldn't happen in
// practice, but keeps this safe to reuse anywhere post data might be
// incomplete).
export default function PostRow({ title, slug, publishedAt }: PostRowProps) {
  if (!slug) return null;

  return (
    <li>
      <Link
        href={`/blog/${slug}`}
        className="group -mx-3 flex items-center justify-between gap-6 rounded-sm px-3 py-6 transition-colors hover:bg-black/[0.03] dark:hover:bg-white/[0.03]"
      >
        <h2 className="text-lg font-normal text-black dark:text-white">{title}</h2>

        <div className="flex shrink-0 items-center gap-3">
          {publishedAt && (
            <p className="dot-font font-doto text-xs tracking-widest text-black/40 uppercase dark:text-white/60">
              {formatPostDate(publishedAt)}
            </p>
          )}
          <ArrowRight
            size={16}
            className="-translate-x-1 text-black/40 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100 dark:text-white/40"
          />
        </div>
      </Link>
    </li>
  );
}
