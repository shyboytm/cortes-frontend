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

      <div className="px-12">
        <PageHeader title="Feed" subtitle="Software Product Designer" />

        <FeedGrid items={items} />
      </div>
    </div>
  );
}
