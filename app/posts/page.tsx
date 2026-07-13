import { client } from "@/sanity/client";
import PrimaryNav from "@/components/ui/PrimaryNav";
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

export default async function PostsIndexPage() {
  const items = await client.fetch<FeedItem[]>(FEED_QUERY, {}, options);

  return (
    <div className="pt-32 pb-24">
      <PrimaryNav />

      <div className="px-12">
        <div className="flex flex-col items-start gap-2 pb-10">
          <h1 className="text-4xl font-normal text-black md:text-5xl dark:text-white">Feed</h1>
          <h2 className="dot-font font-doto text-sm tracking-widest text-black/40 uppercase dark:text-white/80">
            Software Product Designer
          </h2>
        </div>

        <FeedGrid items={items} />
      </div>
    </div>
  );
}
