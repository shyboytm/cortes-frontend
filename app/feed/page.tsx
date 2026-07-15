import { client } from "@/sanity/client";
import PrimaryNav from "@/components/ui/PrimaryNav";
import PageHeader from "@/components/ui/PageHeader";
import FeedGrid, { type FeedItem } from "@/components/ui/FeedGrid";

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

const options = { next: { revalidate: 30 } };

export default async function FeedIndexPage() {
  const items = await client.fetch<FeedItem[]>(FEED_QUERY, {}, options);

  return (
    <div className="pt-32 pb-24">
      <PrimaryNav />

      <div className="px-6">
        <PageHeader title="Feed" subtitle="Random bits of work, experiments, and personal projects that don't have a proper place but I don't want them to live on my hard drive and not see the light of day. Hover each for details and links." />

        <FeedGrid items={items} />
      </div>
    </div>
  );
}
