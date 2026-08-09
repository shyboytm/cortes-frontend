import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight, Instagram } from 'lucide-react';
import {
  SiSpotify,
  SiApplemusic,
  SiBandcamp,
  SiSoundcloud,
  SiYoutubemusic,
} from '@icons-pack/react-simple-icons';
import { type SanityDocument } from 'next-sanity';
import { client, sanityFetchOptions } from '@/sanity/client';
import { urlFor } from '@/sanity/image';
import PrimaryNav from '@/components/ui/PrimaryNav';
import PageHeader from '@/components/ui/PageHeader';
import RemixSequencer from '@/components/ui/RemixSequencer';
import MusicReleaseCard from '@/components/ui/MusicReleaseCard';
import VinylDisc from '@/components/ui/VinylDisc';
import DraggableVinyl from '@/components/ui/DraggableVinyl';
import JumpNav from '@/components/ui/JumpNav';
import { buttonVariants } from '@/components/ui/button';
import { resolvePageMetadata } from '@/lib/page-meta';

const STREAMING_LINKS = [
  { label: '@cordiofm', href: 'https://www.instagram.com/cordiofm', Icon: Instagram },
  { label: 'Spotify', href: '#', Icon: SiSpotify },
  { label: 'Apple Music', href: '#', Icon: SiApplemusic },
  { label: 'Bandcamp', href: '#', Icon: SiBandcamp },
  { label: 'SoundCloud', href: '#', Icon: SiSoundcloud },
  { label: 'YouTube Music', href: '#', Icon: SiYoutubemusic },
];

const LATEST_RELEASES_QUERY = `*[
  _type == "musicRelease" && releaseType in ["album", "ep", "remix"]
] | order(releaseYear desc, order asc, _createdAt desc)[0...4]{
  _id, title, artist, releaseType, genre, releaseYear, link, likes,
  artwork{ alt, asset }
}`;

const RELEASE_ARTWORK_QUERY = `*[
  _type == "musicRelease" && defined(artwork.asset)
]{
  title, artist,
  artwork{ alt, asset }
}`;

const options = sanityFetchOptions();

export async function generateMetadata(): Promise<Metadata> {
  return resolvePageMetadata(
    "music",
    { title: "Cordio", description: "Music that scores the moments in between." },
    "/music"
  );
}

function pickRandomRelease<T>(list: T[]): T | null {
  if (list.length === 0) return null;
  return list[Math.floor(Math.random() * list.length)];
}

export default async function MusicPage() {
  const [releases, releasesWithArt] = await Promise.all([
    client.fetch<SanityDocument[]>(LATEST_RELEASES_QUERY, {}, options),
    client.fetch<SanityDocument[]>(RELEASE_ARTWORK_QUERY, {}, options),
  ]);

  const vinylRelease = pickRandomRelease(releasesWithArt);

  return (
    <div className="pt-32 pb-24">
      <PrimaryNav />

      <div className="px-6">
        <PageHeader title="Cordio" subtitle="Music that scores the moments in between." />

        <JumpNav
          ariaLabel="Listen on"
          sentinelId="music-nav-sentinel"
          className="mt-10 flex flex-wrap gap-3 border-b border-black/10 pb-10 dark:border-white/10"
          items={STREAMING_LINKS.map(({ label, href, Icon }) => (
            <Link
              key={label}
              href={href}
              data-cuelume-hover="tick"
              data-cuelume-press
              className={buttonVariants({ variant: "secondary", size: "sm" })}
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
        />

        <div className="border-b border-black/10 pb-10 dark:border-white/10 columns-1 gap-x-10 text-base leading-relaxed mt-6 text-black/70 md:columns-2 dark:text-white/70">
          <p className="mb-4 break-inside-avoid-column text-lg leading-relaxed text-black/80 dark:text-white/80">
            In addition to my work as a designer, I&apos;m a musician and music producer known for my unique blend of ambient,
            hip-hop-inspired, electronic, sample-heavy music, released under the name Cordio.
            With a deep passion for creating captivating immersive soundscapes and melodies,
            I&apos;ve carved out a distinct sound I use to tell a story to listeners with room for
            their own interpretation.
          </p>
          <p className="mb-4 break-inside-avoid-column text-lg leading-relaxed text-black/80 dark:text-white/80">
            With a background in classical music training, I bring a unique perspective to modern
            electronic music. I grew up in a Hispanic household listening to rap, R&B, salsa,
            bachata, reggaeton, and jazz from an early age, which has stuck with me to this day
            and consistently drives my passion for music.
          </p>
          <p className="mb-4 break-inside-avoid-column text-lg leading-relaxed text-black/80 dark:text-white/80">
            I&apos;ve been playing instruments since I was a child, starting with the violin and later learning the viola,
            piano, cello, guitar, drums. This multi-instrumental background allows me to approach music production 
            with a deep understanding and passion for music, which (hopefully) comes through in my music releases  
            and production style.
          </p>
          <p className="mb-4 break-inside-avoid-column text-lg leading-relaxed text-black/80 dark:text-white/80">
            Drawing inspiration and methods from renowned electronic artists such as Flying Lotus,
            Baths, Shigeto, Shlohmo, and Lemon Jelly, I bring a personal perspective to the music
            scene. My compositions are a fusion of intricate electronic elements, soulful samples,
            unique drum patterns, anime references, video game nods, and infectious rhythms,
            creating a sonic experience that transcends genres. A wide range of musical interests can be heard throughout my discography, and can be
            seen as well in my other musical group with a close friend, HORIZON ✶ RADAR.
          </p>
          <p className="mb-4 break-inside-avoid-column text-lg leading-relaxed text-black/80 dark:text-white/80">
            If you&apos;re a fan of immersive compositions that are hip-hop-inspired, ambient,
            electronic, and sample-heavy, I invite you to explore my music and experience the unique soundscapes I create.
            You can find my music on all major streaming platforms, and you can directly support my work by purchasing my music on <Link href="https://cordio.bandcamp.com" data-cuelume-hover="tick" data-cuelume-press className="link-underline">Bandcamp</Link>.
          </p>
        </div>

        {releases.length > 0 && (
          <div className="mt-16">
            <div className="mb-6 flex items-center justify-between gap-4">
              <h2 className="text-2xl font-normal tracking-wide text-black dark:text-white">Latest releases</h2>
              <Link
                href="/music/releases"
                data-cuelume-hover="tick"
                data-cuelume-press
                className={buttonVariants({ variant: 'secondary', size: 'sm' })}
              >
                View All
                <ArrowRight size={16} />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
              {releases.map((release) => (
                <MusicReleaseCard
                  key={release._id}
                  id={release._id}
                  title={release.title}
                  artist={release.artist}
                  releaseType={release.releaseType}
                  genre={release.genre}
                  releaseYear={release.releaseYear}
                  link={release.link}
                  likes={release.likes}
                  artwork={release.artwork}
                />
              ))}
            </div>
          </div>
        )}

        <div className="mt-16 border-t border-black/10 dark:border-white/10">
          <div className="my-16 max-w-3xl m-auto tracking-wide">
            {vinylRelease && (
              <div className="mb-8 flex justify-center">
                <DraggableVinyl>
                  <VinylDisc
                    size={160}
                    imageUrl={
                      vinylRelease.artwork?.asset
                        ? urlFor(vinylRelease.artwork.asset).width(600).height(600).fit("crop").url()
                        : undefined
                    }
                    imageAlt={vinylRelease.artwork?.alt || vinylRelease.title}
                  />
                </DraggableVinyl>
              </div>
            )}
            <h2 className="mb-3 text-2xl font-normal text-black dark:text-white text-center">Make your own Cordio remix</h2>
            <p className="mb-6 text-black/60 dark:text-white/60 text-center">
              Ever wanted to make your own music? Let&apos;s collab right here, right now with this browser-based remix toy built from
              actual pieces of my Cordio music tracks.
            </p>
          </div>

          <RemixSequencer />
        </div>

      </div>
    </div>
  );
}
