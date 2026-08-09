import Link from "next/link";
import { Newspaper, Video, Mic, Award, ArrowUpRight, type LucideIcon } from "lucide-react";
import { type SanityDocument } from "next-sanity";
import { client, sanityFetchOptions } from "@/sanity/client";

const PRESS_QUERY = `*[
  _type == "pressMention"
] | order(order asc, date desc){
  _id, title, outlet, type, url, date
}`;

const options = sanityFetchOptions(3600);

const TYPE_ICONS: Record<string, LucideIcon> = {
  article: Newspaper,
  video: Video,
  podcast: Mic,
  award: Award,
  other: Newspaper,
};

function formatPressDate(date?: string) {
  if (!date) return null;
  return new Date(date).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export default async function PressSection() {
  const mentions = await client.fetch<SanityDocument[]>(PRESS_QUERY, {}, options);

  if (mentions.length === 0) return null;

  return (
    <div className="mt-14 border-t border-black/10 pt-8 dark:border-white/10">
      <h2 className="dot-font mb-6 font-doto text-xs tracking-widest text-black/60 uppercase dark:text-white/60">
        / In the Press
      </h2>
      <ul className="grid grid-cols-1 gap-x-8 lg:grid-cols-2">
        {mentions.map((mention) => {
          const Icon = TYPE_ICONS[mention.type as string] ?? Newspaper;
          const formattedDate = formatPressDate(mention.date);

          const content = (
            <div className="flex items-center justify-between gap-4 py-4">
              <div className="flex min-w-0 items-center gap-4">
                <Icon size={16} className="shrink-0 text-black/60 dark:text-white/60" />
                <div className="min-w-0 flex flex-col">
                  <p className="truncate text-base text-black dark:text-white">{mention.title}</p>
                  <p className="dot-font mt-1 font-doto text-xs tracking-widest text-black/60 uppercase dark:text-white/60">
                    {mention.outlet}
                    {formattedDate ? ` · ${formattedDate}` : ""}
                  </p>
                </div>
              </div>
              {mention.url && (
                <ArrowUpRight
                  size={16}
                  className="-translate-x-1 shrink-0 text-black/60 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100 dark:text-white/60"
                />
              )}
            </div>
          );

          return (
            <li key={mention._id} className="border-b border-black/10 last:border-b-0 lg:[&:nth-last-child(2)]:border-b-0 dark:border-white/10">
              {mention.url ? (
                <Link
                  href={mention.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group -mx-4 block rounded-md px-4 transition-colors hover:bg-black/[0.03] dark:hover:bg-white/[0.03]"
                >
                  {content}
                </Link>
              ) : (
                content
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
