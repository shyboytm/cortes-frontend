import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { formatPostDate } from "@/lib/utils";
import LikeButton from "@/components/ui/LikeButton";

export interface PostRowProps {
  _id: string;
  title: string;
  slug?: string;
  publishedAt?: string;
  likes?: number;
}

// One blog post's teaser row: title on the left, published date on the
// right, the whole row linking to the post. A background tint and sliding
// arrow appear on hover. Renders nothing if the post has no slug.
export default function PostRow({ _id, title, slug, publishedAt, likes }: PostRowProps) {
  if (!slug) return null;

  return (
    <li>
      <Link
        href={`/writing/${slug}`}
        data-cuelume-hover="tick"
        className="group -mx-3 flex flex-col items-start gap-2 rounded-md px-4 py-4 transition-colors hover:bg-black/[0.03] sm:flex-row sm:items-center sm:justify-between sm:gap-6 dark:hover:bg-white/[0.03]"
      >
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-normal tracking-wide text-black dark:text-white">{title}</h2>
          <LikeButton id={_id} initialLikes={likes ?? 0} variant="minimal" />
        </div>

        <div className="flex shrink-0 items-center gap-3">
          {publishedAt && (
            <p className="dot-font font-doto text-xs tracking-widest text-black/60 uppercase dark:text-white/60">
              {formatPostDate(publishedAt)}
            </p>
          )}
          <ArrowRight
            size={16}
            className="-translate-x-1 text-black/60 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100 dark:text-white/60"
          />
        </div>
      </Link>
    </li>
  );
}
