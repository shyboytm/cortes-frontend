import { client, sanityFetchOptions } from "@/sanity/client";
import PrimaryNav from "@/components/ui/PrimaryNav";
import PageHeader from "@/components/ui/PageHeader";
import MusicReleasesFilter, { type ReleaseFilterItem } from "@/components/ui/MusicReleasesFilter";
import { BackLink } from "@/components/ui/LinkPill";

const ALL_RELEASES_QUERY = `*[
  _type == "musicRelease"
] | order(releaseYear desc, order asc, _createdAt desc){
  _id, title, artist, releaseType, genre, releaseYear, link, likes,
  artwork{ alt, asset }
}`;

const options = sanityFetchOptions();

export default async function MusicReleasesPage() {
  const releases = await client.fetch<ReleaseFilterItem[]>(ALL_RELEASES_QUERY, {}, options);

  return (
    <div className="pt-32 pb-24">
      <PrimaryNav />

      <div className="px-6">
        <BackLink href="/music" iconSize={18} />

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
          <div className="mt-10">
            <MusicReleasesFilter releases={releases} />
          </div>
        )}
      </div>
    </div>
  );
}
