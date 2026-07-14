import Link from 'next/link';
import {
  SiSpotify,
  SiApplemusic,
  SiBandcamp,
  SiSoundcloud,
  SiYoutubemusic,
} from '@icons-pack/react-simple-icons';
import PrimaryNav from '@/components/ui/PrimaryNav';
import RemixSequencer from '@/components/ui/RemixSequencer';
import { buttonVariants } from '@/components/ui/button';

const STREAMING_LINKS = [
  { label: 'Spotify', href: '#', Icon: SiSpotify },
  { label: 'Apple Music', href: '#', Icon: SiApplemusic },
  { label: 'Bandcamp', href: '#', Icon: SiBandcamp },
  { label: 'SoundCloud', href: '#', Icon: SiSoundcloud },
  { label: 'YouTube Music', href: '#', Icon: SiYoutubemusic },
];

export default function MusicPage() {
  return (
    <div className="pt-32 pb-24">
      <PrimaryNav />

      <div className="px-12">
        <div className="max-w-3xl">
          <p className="dot-font font-doto mb-4 text-xs tracking-widest text-green-800 uppercase dark:text-green-400">
            Music
          </p>
          <h1 className="mb-6 text-5xl font-normal text-black md:text-6xl dark:text-white">Cordio</h1>
          <p className="text-xl leading-relaxed text-black/70 dark:text-white/70">
            Music that scores the moments in between. Cordio is where the Figma file closes and the
            synth opens — ambient textures, half-remembered melodies, and rhythms built for scenes
            that haven&apos;t happened yet. Made for film, games, and podcasts, and for anyone who
            just wants something to disappear into.
          </p>
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          {STREAMING_LINKS.map(({ label, href, Icon }) => (
            <Link
              key={label}
              href={href}
              className={buttonVariants({ variant: "secondary", size: "sm" })}
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </div>

        <div className="mt-20 max-w-3xl">
          <h2 className="mb-3 text-2xl font-normal text-black dark:text-white">Remix it yourself</h2>
          <p className="mb-6 text-black/60 dark:text-white/60">
            A working sketch of a bigger idea — a browser-based remix toy built from actual pieces of
            Cordio tracks. Pick a song from the dropdown, toggle steps, and layer in the loop pads to
            see what you land on.
          </p>
        </div>

        <div className="max-w-3xl">
          <RemixSequencer />
        </div>
      </div>
    </div>
  );
}
