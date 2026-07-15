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
// creation time as a last resort. Singles are left out here — this teaser
// grid is meant to highlight full releases, not one-off tracks.
const LATEST_RELEASES_QUERY = `*[
  _type == "musicRelease" && releaseType in ["album", "ep", "remix"]
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

        <div className="border-b border-black/10 pb-10 dark:border-white/10 columns-1 gap-x-10 text-base leading-relaxed mt-6 text-black/70 md:columns-2 dark:text-white/70">
          <p className="mb-4 break-inside-avoid-column">
            In addition to my work as a designer, I&apos;m a musician and music producer known for my unique blend of ambient,
            hip-hop-inspired, electronic, sample-heavy music, released under the name Cordio.
            With a deep passion for creating captivating immersive soundscapes and melodies,
            I&apos;ve carved out a distinct sound I use to tell a story to listeners with room for
            their own interpretation.
          </p>
          <p className="mb-4 break-inside-avoid-column">
            With a background in classical music training, I bring a unique perspective to modern
            electronic music. I grew up in a Hispanic household listening to rap, R&B, salsa,
            bachata, reggaeton, and jazz from an early age, which has stuck with me to this day
            and consistently drives my passion for music.
          </p>
          <p className="mb-4 break-inside-avoid-column">
            Drawing inspiration and methods from renowned electronic artists such as Flying Lotus,
            Baths, Shigeto, Shlohmo, and Lemon Jelly, I bring a personal perspective to the music
            scene. My compositions are a fusion of intricate electronic elements, soulful samples,
            unique drum patterns, anime references, video game nods, and infectious rhythms,
            creating a sonic experience that transcends genres. A wide range of musical interests can be heard throughout my discography, and can be
            seen as well in my other musical group with a close friend, HORIZON ✶ RADAR.
          </p>
          <p className="mb-4 break-inside-avoid-column">
            If you&apos;re a fan of immersive compositions that are hip-hop-inspired, ambient,
            electronic, and sample-heavy, I invite you to explore my music and experience the unique soundscapes I create.
            You can find my music on all major streaming platforms, and you can directly support my work by purchasing my music on <Link href="https://cordio.bandcamp.com" className="link-underline">Bandcamp</Link>.
          </p>
        </div>

        {releases.length > 0 && (
          <div className="mt-16">
            <div className="mb-6 flex items-center justify-between gap-4">
              <h2 className="text-2xl font-normal tracking-wide text-black dark:text-white">Latest releases</h2>
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

        <div className="mt-16 border-t border-black/10 dark:border-white/10">
          <div className="my-16 max-w-3xl m-auto tracking-wide">
            <h2 className="mb-3 text-2xl font-normal text-black dark:text-white text-center">Make your own Cordio remix</h2>
            <p className="mb-6 text-black/60 dark:text-white/60 text-center">
              Ever wanted to make your own music? Let's collab right here, right now with this browser-based remix toy built from 
              actual pieces of my Cordio music tracks. Pick a song from the dropdown, toggle stems from the tracks, and layer in your own 
              drum loop pads to see what you land on!
            </p>
          </div>

          <RemixSequencer />
        </div>

      </div>
    </div>
  );
}
