import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import {
  SiSpotify,
  SiApplemusic,
  SiBandcamp,
  SiSoundcloud,
  SiYoutubemusic,
} from '@icons-pack/react-simple-icons';
import { type SanityDocument } from 'next-sanity';
import { client } from '@/sanity/client';
import PrimaryNav from '@/components/ui/PrimaryNav';
import PageHeader from '@/components/ui/PageHeader';
import RemixSequencer from '@/components/ui/RemixSequencer';
import MusicReleaseCard from '@/components/ui/MusicReleaseCard';
import { buttonVariants } from '@/components/ui/button';

const STREAMING_LINKS = [
  { label: 'Spotify', href: '#', Icon: SiSpotify },
  { label: 'Apple Music', href: '#', Icon: SiApplemusic },
  { label: 'Bandcamp', href: '#', Icon: SiBandcamp },
  { label: 'SoundCloud', href: '#', Icon: SiSoundcloud },
  { label: 'YouTube Music', href: '#', Icon: SiYoutubemusic },
];

// Newest first: by year, then the optional manual "order" tiebreaker, then
// creation time as a last resort.
const LATEST_RELEASES_QUERY = `*[
  _type == "musicRelease"
] | order(releaseYear desc, order asc, _createdAt desc)[0...4]{
  _id, title, artist, releaseType, genre, releaseYear, link,
  artwork{ alt, asset }
}`;

const options = { next: { revalidate: 30 } };

export default async function MusicPage() {
  const releases = await client.fetch<SanityDocument[]>(LATEST_RELEASES_QUERY, {}, options);

  return (
    <div className="pt-32 pb-24">
      <PrimaryNav />

      <div className="px-6">
        <PageHeader title="Cordio" subtitle="Music that scores the moments in between." />

        <p className="max-w-3xl text-xl leading-relaxed text-black/70 dark:text-white/70">
          Cordio is where the Figma file closes and the synth opens ambient textures,
          half-remembered melodies, and rhythms built for scenes that haven&apos;t happened yet.
          Made for film, games, and podcasts, and for anyone who just wants something to
          disappear into.
        </p>

        <nav
          aria-label="Listen on"
          className="mt-10 flex flex-wrap gap-3 border-b border-black/10 pb-10 dark:border-white/10"
        >
          {STREAMING_LINKS.map(({ label, href, Icon }) => (
            <Link
              key={label}
              href={href}
              className={buttonVariants({ variant: "secondary", size: "sm" })}
            >
              <Icon size={16} />
              <span className="inline-block translate-y-[1px]">{label}</span>
            </Link>
          ))}
        </nav>

        {releases.length > 0 && (
          <div className="mt-14">
            <div className="mb-6 flex items-center justify-between gap-4">
              <h2 className="text-2xl font-normal text-black dark:text-white">Latest releases</h2>
              <Link
                href="/music/releases"
                className={buttonVariants({ variant: 'secondary', size: 'sm' })}
              >
                <span className="inline-block translate-y-[1px]">View All</span>
                <ArrowRight size={16} />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
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
          </div>
        )}

        <div className="mt-20 max-w-3xl">
          <h2 className="mb-3 text-2xl font-normal text-black dark:text-white">Remix it yourself</h2>
          <p className="mb-6 text-black/60 dark:text-white/60">
            A working sketch of a bigger idea a browser-based remix toy built from actual pieces of
            Cordio tracks. Pick a song from the dropdown, toggle steps, and layer in the loop pads to
            see what you land on.
          </p>
        </div>

        <RemixSequencer />
      </div>
    </div>
  );
}
