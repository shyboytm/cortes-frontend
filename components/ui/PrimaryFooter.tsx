import Image from "next/image";
import Link from "next/link";
import { SiLastdotfm } from "@icons-pack/react-simple-icons";
import { getNowPlaying } from "@/lib/lastfm";
import FooterScene from "@/components/ui/FooterScene";
import GlobeIcon from "@/components/ui/GlobeIcon";
import WorkTogetherCTA from "@/components/ui/WorkTogetherCTA";
import ViewportSize from "@/components/ui/ViewportSize";
import NashvilleStatus, {
  LATITUDE,
  LONGITUDE,
  WEATHER_LABELS,
  type Weather,
} from "@/components/ui/NashvilleStatus";
import NewsletterSignup from "@/components/ui/NewsletterSignup";
import { SOCIAL_LINKS } from "@/lib/social-links";

// Decorative pixel-art marks rendered along the bottom of the footer.
// Width/height match each file's own viewBox so the aspect ratio stays
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

// Replicates NashvilleStatus's client-side Open-Meteo request so the
// footer (an async Server Component) can seed it with a real initial
// value instead of a blank/loading state on first render. PrimaryFooter
// renders on every route, so this is cached for 10 minutes (matching
// NashvilleStatus's own client-side refresh interval) — without it, Next
// would re-hit Open-Meteo on every single page render and get rate-limited.
async function fetchInitialWeather(): Promise<Weather | null> {
  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${LATITUDE}&longitude=${LONGITUDE}&current=temperature_2m,weather_code&temperature_unit=fahrenheit&timezone=America%2FChicago`,
      {
        next: { revalidate: 600 },
        // Node's fetch sends no User-Agent by default, unlike a browser —
        // some APIs (Open-Meteo included) reject header-less server
        // requests with a 403, so a normal browser-like one is set here.
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        },
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const tempF = data?.current?.temperature_2m;
    const code = data?.current?.weather_code;
    if (typeof tempF === "number") {
      return { tempF: Math.round(tempF), label: WEATHER_LABELS[code] ?? "Conditions unknown" };
    }
    return null;
  } catch {
    // A failed initial fetch just means NashvilleStatus starts blank and
    // falls back to its own client-side fetch — not worth surfacing as an
    // error.
    return null;
  }
}

export default async function PrimaryFooter() {
  const [track, initialWeather] = await Promise.all([getNowPlaying(), fetchInitialWeather()]);

  return (
    <footer className="relative overflow-hidden">
      {/* Large, subtle 3D shape that leans toward the cursor and randomly
          swaps its geometry, sitting behind everything as a decorative
          background element. */}
      <FooterScene />

      <div className="group absolute right-8 bottom-2 z-11 h-20 w-20 translate-y-4 sm:h-28 sm:w-28">
        <div className="pointer-events-none absolute bottom-full font-bold left-2 text-center mb-0 w-max max-w-[150px] -translate-x-1/2 rounded-md p-2 text-xs opacity-0 shadow-sm transition-opacity duration-200 group-hover:opacity-100 dark:border-white/10 bg-violet-950 text-white">
          Fun fact, my favorite Pok&eacute;mon is Gengar!
        </div>
        <Image
          src="/gengar-pokemon-2d.gif"
          alt="Gengar"
          unoptimized
          width={224}
          height={224}
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
              <NashvilleStatus
                className="dot-font font-doto text-xs tracking-widest text-black/80 uppercase dark:text-white/80"
                initialWeather={initialWeather ?? undefined}
              />
            </div>

            {track && (
              <Link
                href={track.url ?? "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex w-full items-center gap-4 rounded-md border border-black/10 py-4 pr-6 pl-4 transition-colors hover:border-black/20 sm:w-[380px] bg-transparent dark:hover:bg-white/5 hover:bg-black/10 dark:border-white/10 dark:hover:border-white/20"
              >
                {/* Vinyl record: black disc and groove rings, always
                    spinning, with the album art (or a Last.fm fallback
                    icon) as the center label. */}
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

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:col-span-7">
            <NewsletterSignup />

            <div>
              <p className="dot-font mb-4 font-doto text-xs tracking-widest text-black/60 uppercase dark:text-white/60">
                / Social
              </p>
              {/* Bare icons with no pill or label. Sized/spaced to match the
                  nav overlay's own social row (20px icons, gap-5) — was
                  smaller and tighter here, which read oddly next to the
                  overlay's larger touch targets on mobile. */}
              <div className="flex flex-wrap gap-5">
                {SOCIAL_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={link.label}
                    className="text-black/60 transition-colors hover:text-black dark:text-white/60 dark:hover:text-white"
                  >
                    <link.icon size={20} className="svg-shadow" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-start gap-2 border-t border-black/10 pt-6 text-xs tracking-widest text-black/60 uppercase dark:border-white/10 dark:text-white/60">
          <p className="dot-font font-doto leading-[1.5]">CRTS v1.0.0 | Next.js, TypeScript, Tailwind, Shaders, Vercel, Three.js</p>
          <ViewportSize className="dot-font font-doto" />
          <p className="dot-font font-doto">
            {/* Space Mono's © glyph sits noticeably smaller/lighter in its
                character cell than the surrounding text — bumped up and
                aligned to compensate, sized relative to the parent's own
                font-size (via em) so it still tracks correctly if this
                line's text size ever changes. */}
            <span className="align-middle text-[1.4em]">©</span> {new Date().getFullYear()} Dennis Cortes
          </p>

          <div aria-hidden className="mt-4 flex flex-wrap items-end gap-4 opacity-25 sm:gap-2">
            {ACCENT_GRAPHICS.map(({ file, width, height }) => (
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
