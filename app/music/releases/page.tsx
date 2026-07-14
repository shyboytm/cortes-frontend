import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { type SanityDocument } from "next-sanity";
import { client } from "@/sanity/client";
import PrimaryNav from "@/components/ui/PrimaryNav";
import PageHeader from "@/components/ui/PageHeader";
import MusicReleaseCard from "@/components/ui/MusicReleaseCard";
import { buttonVariants } from "@/components/ui/button";

const ALL_RELEASES_QUERY = `*[
  _type == "musicRelease"
] | order(releaseYear desc, order asc, _createdAt desc){
  _id, title, artist, releaseType, genre, releaseYear, link,
  artwork{ alt, asset }
}`;

const options = { next: { revalidate: 30 } };

export default async function MusicReleasesPage() {
  const releases = await client.fetch<SanityDocument[]>(ALL_RELEASES_QUERY, {}, options);

  return (
    <div className="pt-32 pb-24">
      <PrimaryNav />

      <div className="px-6">
        <Link
          href="/music"
          className={buttonVariants({ variant: "secondary", size: "sm" })}
        >
          <ArrowLeft size={18} /> <span className="inline-block translate-y-[1px]">Back</span>
        </Link>

        <PageHeader
          title="Releases"
          subtitle="Every Cordio and Horizon Radar release, in one place. Also available anywhere you stream music."
          className="mt-6"
        />

        {releases.length === 0 ? (
          <p className="text-black/60 dark:text-white/60">
            Nothing here yet — add a release in Sanity to get started.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
            {releases.map((release) => (
              <MusicReleaseCard
                key={release._id}
                title={release.title}
                artist={release.artist}
                releaseType={release.releaseType}
                genre={release.genre}
                releaseYear={release.releaseYear}
                link={release.link}
                artwork={release.artwork}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
