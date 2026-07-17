import { type SanityDocument } from "next-sanity";
import { client } from "@/sanity/client";
import PrimaryNav from "@/components/ui/PrimaryNav";
import PageHeader from "@/components/ui/PageHeader";
import WorkRow from "@/components/ui/WorkRow";
import FeedGrid, { type FeedItem } from "@/components/ui/FeedGrid";

const WORK_QUERY = `*[
  _type == "work"
  && defined(slug.current)
]|order(order asc, _createdAt desc){
  _id,
  title,
  dateRange,
  slug,
  mainImage{
    alt,
    asset
  },
  hoverImage{
    alt,
    asset
  },
  "hasCaseStudy": count(caseStudy) > 0
}`;

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
    "aspectRatio": asset->metadata.dimensions.aspectRatio
  },
  video{
    "url": asset->url,
    "mimeType": asset->mimeType
  }
}`;

const WORK_SUBTITLE =
  "Some of my featured work from over the years including full-time jobs, personal projects, and freelance contracts.";

const options = { next: { revalidate: 30 } };

export default async function WorkIndexPage() {
  const [workItems, feedItems] = await Promise.all([
    client.fetch<SanityDocument[]>(WORK_QUERY, {}, options),
    client.fetch<FeedItem[]>(FEED_QUERY, {}, options),
  ]);

  return (
    <div className="pt-32 pb-24">
      <PrimaryNav />

      <div className="px-6">
        <PageHeader title="Featured Projects" subtitle={WORK_SUBTITLE} />

        <div className="mt-8 grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {workItems.map((work) => (
            <WorkRow
              key={work._id}
              title={work.title}
              dateRange={work.dateRange}
              mainImage={work.mainImage}
              hoverImage={work.hoverImage}
              slug={work.slug?.current}
              hasCaseStudy={work.hasCaseStudy}
            />
          ))}
        </div>

        {/* Feed: smaller, more informal work items shown underneath the featured projects. */}
        <div className="mt-14 border-t border-black/10 pt-8 dark:border-white/10">
          <PageHeader
            title="Feed"
            subtitle="Random bits of work, experiments, and personal projects that don't have a proper place but I don't want them to live on my hard drive and not see the light of day."
          />
          <FeedGrid items={feedItems} />
        </div>
      </div>
    </div>
  );
}
