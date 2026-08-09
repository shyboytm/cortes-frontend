import type { Metadata } from "next";
import { client, sanityFetchOptions } from "@/sanity/client";
import { WORK_QUERY } from "@/sanity/queries";
import { shuffleArray } from "@/lib/utils";
import PrimaryNav from "@/components/ui/PrimaryNav";
import PageHeader from "@/components/ui/PageHeader";
import WorkGrid, { type WorkGridItem } from "@/components/ui/WorkGrid";
import FeedGrid, { type FeedItem } from "@/components/ui/FeedGrid";
import { resolvePageMetadata } from "@/lib/page-meta";

const FEED_QUERY = `*[
  _type == "feedItem"
]|order(order asc, _createdAt desc){
  _id,
  caption,
  link,
  likes,
  image{
    alt,
    asset,
    "aspectRatio": asset->metadata.dimensions.aspectRatio,
    "lqip": asset->metadata.lqip
  },
  video{
    "url": asset->url,
    "mimeType": asset->mimeType
  }
}`;

const WORK_SUBTITLE =
  "Some of my featured work from over the years including full-time jobs, personal projects, and freelance contracts.";

const options = sanityFetchOptions();

export async function generateMetadata(): Promise<Metadata> {
  return resolvePageMetadata("work", { title: "Work", description: WORK_SUBTITLE }, "/work");
}

export default async function WorkIndexPage() {
  const [workItems, feedItems] = await Promise.all([
    client.fetch<WorkGridItem[]>(WORK_QUERY, {}, options),
    client.fetch<FeedItem[]>(FEED_QUERY, {}, options),
  ]);

  return (
    <div className="pt-32 pb-24">
      <PrimaryNav />

      <div className="px-6">
        <PageHeader title="Featured Projects" subtitle={WORK_SUBTITLE} />

        <WorkGrid
          workItems={workItems}
          className="mt-8 grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3"
        />

        <div className="mt-14 border-t border-black/10 pt-8 dark:border-white/10">
          <PageHeader
            title="Feed"
            subtitle="Random bits of work, experiments, and personal projects that don't have a proper place but I don't want them to live on my hard drive and not see the light of day."
          />
          <FeedGrid items={shuffleArray(feedItems)} />
        </div>
      </div>
    </div>
  );
}
