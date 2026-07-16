import Image from "next/image";
import Link from "next/link";
import { Instagram, Linkedin } from "lucide-react";
import {
  SiLastdotfm,
  SiBuymeacoffee,
  SiGithub,
  SiX,
  SiDribbble,
  SiYoutube,
} from "@icons-pack/react-simple-icons";
import { getNowPlaying } from "@/lib/lastfm";
import FooterScene from "@/components/ui/FooterScene";
import GlobeIcon from "@/components/ui/GlobeIcon";
import WorkTogetherCTA from "@/components/ui/WorkTogetherCTA";
import ViewportSize from "@/components/ui/ViewportSize";
import NashvilleStatus from "@/components/ui/NashvilleStatus";
import { buttonVariants } from "@/components/ui/button";

// Real routes only — Photos doesn't have a page yet, so (unlike PrimaryNav)
// it's left out here rather than linking to "#". Feed no longer has its
// own route — that section now lives under Work.
const EXPLORE_LINKS = [
  { label: "Work", href: "/work" },
  { label: "Writing", href: "/writing" },
  { label: "Music", href: "/music" },
  { label: "Recs", href: "/recs" },
  { label: "Shop", href: "/shop" },
  { label: "About", href: "/about" },
];

// Decorative pixel-art marks dropped into /public — purely a visual
// flourish along the very bottom of the footer, not linked to anything.
// Real width/height (from each file's own viewBox) keeps aspect ratio
// correct when only a height is set via className.
const ACCENT_GRAPHICS = [
  { file: "accent-graphic-01.svg", width: 496, height: 133 },
  { file: "accent-graphic-02.svg", width: 123, height: 69 },
  { file: "accent-graphic-03.svg", width: 71, height: 61 },
  { file: "accent-graphic-04.svg", width: 66, height: 66 },
  { file: "accent-graphic-05.svg", width: 56, height: 67 },
  { file: "accent-graphic-06.svg", width: 78, height: 69 },
  { file: "accent-graphic-07.svg", width: 40, height: 73 },
  { file: "accent-graphic-08.svg", width: 53, height: 69 },
  { file: "accent-graphic-09.svg", width: 111, height: 69 },
];

const SOCIAL_LINKS = [
  { label: "Instagram", href: "https://www.instagram.com/shyboytm/", icon: Instagram },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/fromcortes/", icon: Linkedin },
  { label: "GitHub", href: "https://github.com/shyboytm", icon: SiGithub },
  { label: "X", href: "https://x.com/shyboytm", icon: SiX },
  { label: "Dribbble", href: "https://dribbble.com/shyboytm", icon: SiDribbble },
  { label: "YouTube", href: "https://www.youtube.com/cortesarts", icon: SiYoutube },
  { label: "Buy Me a Coffee", href: "https://buymeacoffee.com/cortes", icon: SiBuymeacoffee },
];

// Shared pill badge for the Explore/Social groups — same hairline-border,
// rounded-full language as buttonVariants' "secondary" look.
function FooterPill({
  href,
  external,
  children,
}: {
  href: string;
  external?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={buttonVariants({ variant: "secondary", size: "sm" })}
    >
      {children}
    </Link>
  );
}

export default async function PrimaryFooter() {
  const track = await getNowPlaying();

  return (
    <footer className="relative overflow-hidden">
      {/* Large, subtle 3D shape that leans toward the cursor and randomly
          swaps its geometry — purely decorative, sits behind everything. */}
      <FooterScene />

      <div className="group absolute right-8 bottom-2 z-11 h-20 w-20 translate-y-4 sm:h-28 sm:w-28">
        <div className="pointer-events-none absolute bottom-full font-bold left-2 text-center mb-2 w-max max-w-[150px] -translate-x-1/2 rounded-md p-2 text-xs opacity-0 shadow-sm transition-opacity duration-200 group-hover:opacity-100 dark:border-white/10 bg-violet-950 text-white">
          Fun fact, my favorite Pok&eacute;mon is Gengar!
        </div>
        <Image
          src="/gengar-pokemon-2d.gif"
          alt="Gengar"
          unoptimized
          width={500}
          height={500}
          className="h-full w-full select-none object-contain opacity-90"
        />
      </div>

      <WorkTogetherCTA />

      <div className="relative z-10 p-6">
       
        <div
          aria-hidden
          className="dot-font mb-10 hidden items-center justify-between font-doto text-black/20 uppercase sm:flex dark:text-white/20"
        >
          {Array.from({ length: 14 }).map((_, i) => (
            <span key={i}>+</span>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="flex flex-col gap-12 lg:col-span-5">
            <div className="flex flex-col gap-2">
              <p className="text-2xl tracking-wide text-black dark:text-white">
                Dennis Cortés
              </p>
              <div className="flex items-center gap-2 tracking-widest text-black/70 dark:text-white/60">
                <GlobeIcon className="h-3.5 w-auto mr-1 svg-shadow" />
                <p className="dot-font my-2 font-doto text-xs tracking-widest text-black/80 uppercase dark:text-white/80">
                  36.1627° N, 86.7816° W
                </p>
              </div>
              <NashvilleStatus className="dot-font font-doto text-xs tracking-widest text-black/80 uppercase dark:text-white/80" />
            </div>

            {track && (
              <Link
                href={track.url ?? "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex w-full items-center gap-4 rounded-md border border-black/10 py-4 pr-6 pl-4 transition-colors hover:border-black/20 sm:w-[380px] bg-transparent dark:hover:bg-white/5 hover:bg-black/10 dark:border-white/10 dark:hover:border-white/20"
              >
                {/* Vinyl record: black disc + groove rings, always spinning
                    (whether or not something's actively playing right now),
                    with the album art (or a Last.fm fallback icon) as the
                    center label. */}
                <div className="relative h-16 w-16 shrink-0 rounded-full bg-black shadow-inner [animation:spin_7s_linear_infinite] motion-reduce:animate-none dark:bg-neutral-800">
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{
                      backgroundImage:
                        "repeating-radial-gradient(circle at center, transparent 0px, transparent 3px, rgba(255,255,255,0.12) 4px)",
                    }}
                  />
                  <div className="absolute top-1/2 left-1/2 h-7 w-7 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full border border-white/20 bg-black/40">
                    {track.imageUrl ? (
                      <Image
                        src={track.imageUrl}
                        alt={track.album || track.title}
                        fill
                        className="object-cover"
                        sizes="28px"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-white/60">
                        <SiLastdotfm size={12} />
                      </div>
                    )}
                  </div>
                  <div className="absolute top-1/2 left-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/70" />
                </div>

                <div className="flex flex-col gap-1 overflow-hidden tracking-wider">
                  <span className="dot-font font-doto text-xs tracking-widest text-green-800 uppercase dark:text-green-400">
                    {track.isNowPlaying ? "Now Playing" : "Last Played"}
                  </span>
                  <span className="max-w-[300px] truncate text-sm text-black dark:text-white">
                    {track.title}
                  </span>
                  <span className="max-w-[300px] truncate text-xs text-black/60 dark:text-white/60">
                    by {track.artist}
                  </span>
                </div>
              </Link>
            )}
          </div>

          <div className="grid grid-cols-2 gap-8 lg:col-span-7">
            <div>
              <p className="dot-font mb-4 font-doto text-xs tracking-widest text-black/60 uppercase dark:text-white/60">
                / Explore
              </p>
              <div className="flex flex-wrap gap-2">
                {EXPLORE_LINKS.map((link) => (
                  <FooterPill key={link.href} href={link.href}>
                    {link.label}
                  </FooterPill>
                ))}
              </div>
            </div>

            <div>
              <p className="dot-font mb-4 font-doto text-xs tracking-widest text-black/60 uppercase dark:text-white/60">
                / Social
              </p>
              {/* Bare icons (no pill/label) — matches the treatment in the
                  primary nav's fullscreen menu rather than the labeled
                  pills used for Explore. */}
              <div className="flex flex-wrap gap-4">
                {SOCIAL_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={link.label}
                    className="text-black/60 transition-colors hover:text-black dark:text-white/60 dark:hover:text-white"
                  >
                    <link.icon size={18} />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-start gap-2 border-t border-black/10 pt-6 text-xs tracking-widest text-black/60 uppercase dark:border-white/10 dark:text-white/60">
          <p className="dot-font font-doto">© {new Date().getFullYear()} Dennis Cortes</p>
          <p className="dot-font font-doto leading-[1.5]">CRTS v1.0.0 | Next.js, TypeScript, Tailwind, Shaders, Vercel, Three.js</p>
          <ViewportSize className="dot-font font-doto" />

          {/* Each mark is drawn as solid white in its source file — `invert`
              flips that to black for light mode, and `dark:invert-0`
              cancels the flip back to white once the page is dark, so the
              same asset works against either background. */}
          <div aria-hidden className="mt-4 flex flex-wrap items-end gap-4 opacity-25 sm:gap-2">
            {ACCENT_GRAPHICS.map(({ file, width, height }) => (
              /* eslint-disable-next-line @next/next/no-img-element -- next/image's
                 optimizer refuses local SVGs without dangerouslyAllowSVG, and
                 these are purely decorative, non-optimized marks anyway. */
              <img
                key={file}
                src={`/${file}`}
                alt=""
                width={width}
                height={height}
                className="h-4 w-auto invert dark:invert-0 sm:h-6"
              />
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
