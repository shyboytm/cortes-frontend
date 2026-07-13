import Image from "next/image";
import Link from "next/link";
import { Instagram, Linkedin } from "lucide-react";
import { SiLastdotfm } from "@icons-pack/react-simple-icons";
import { getNowPlaying } from "@/lib/lastfm";
import FooterScene from "@/components/ui/FooterScene";
import GlobeIcon from "@/components/ui/GlobeIcon";

// Real routes only — Photos/Contact don't have pages yet, so (unlike
// PrimaryNav) they're left out here rather than linking to "#".
const EXPLORE_LINKS = [
  { label: "Work", href: "/work" },
  { label: "Feed", href: "/feed" },
  { label: "Blog", href: "/blog" },
  { label: "Music", href: "/music" },
];

const SOCIAL_LINKS = [
  { label: "Instagram", href: "https://www.instagram.com/shyboytm/", icon: Instagram },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/fromcortes/", icon: Linkedin },
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
      className="inline-flex items-center gap-1.5 rounded-full border border-black/10 px-4 py-2 text-xs tracking-widest text-black/70 uppercase transition-colors hover:border-black/30 hover:text-black dark:border-white/10 dark:text-white/70 dark:hover:border-white/30 dark:hover:text-white"
    >
      {children}
    </Link>
  );
}

export default async function PrimaryFooter() {
  const track = await getNowPlaying();

  return (
    <footer className="relative overflow-hidden border-t border-black/10 dark:border-white/10">
      {/* Large, subtle 3D shape that leans toward the cursor and randomly
          swaps its geometry — purely decorative, sits behind everything. */}
      <FooterScene />

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
          <div className="flex flex-col gap-6 lg:col-span-5">
            <div>
              <p className="dot-font font-doto text-2xl tracking-widest text-black uppercase dark:text-white">
                Dennis Cortes
              </p>
              <div className="flex items-center gap-2 tracking-widest text-black/70 dark:text-white/50">
                <GlobeIcon className="h-3.5 w-auto mr-1 svg-shadow" />
                <p className="dot-font my-2 font-doto text-xs tracking-widest text-black/50 uppercase dark:text-white/50">
                  36.1627° N, 86.7816° W
                </p>
              </div>
            </div>

            {track && (
              <Link
                href={track.url ?? "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex w-full items-center gap-4 rounded-md border border-black/10 py-4 pr-6 pl-4 transition-colors hover:border-black/30 sm:w-[380px] dark:border-white/10 dark:hover:border-white/30"
              >
                {/* Vinyl record: black disc + groove rings, spinning while
                    the track is actually playing (paused otherwise), with
                    the album art (or a Last.fm fallback icon) as the center
                    label. */}
                <div
                  className="relative h-16 w-16 shrink-0 rounded-full bg-black shadow-inner [animation:spin_7s_linear_infinite] motion-reduce:animate-none dark:bg-neutral-800"
                  style={{ animationPlayState: track.isNowPlaying ? "running" : "paused" }}
                >
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
                      <div className="flex h-full w-full items-center justify-center text-white/40">
                        <SiLastdotfm size={12} />
                      </div>
                    )}
                  </div>
                  <div className="absolute top-1/2 left-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/70" />
                </div>

                <div className="flex flex-col overflow-hidden">
                  <span className="dot-font font-doto text-[10px] tracking-widest text-green-800 uppercase dark:text-green-400">
                    {track.isNowPlaying ? "Now Playing" : "Last Played"}
                  </span>
                  <span className="max-w-[300px] truncate text-sm text-black dark:text-white">
                    {track.title}
                  </span>
                  <span className="max-w-[300px] truncate text-xs text-black/50 dark:text-white/50">
                    {track.artist}
                  </span>
                </div>
              </Link>
            )}
          </div>

          <div className="grid grid-cols-2 gap-8 lg:col-span-7">
            <div>
              <p className="dot-font mb-4 font-doto text-xs tracking-widest text-black/40 uppercase dark:text-white/40">
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
              <p className="dot-font mb-4 font-doto text-xs tracking-widest text-black/40 uppercase dark:text-white/40">
                / Social
              </p>
              <div className="flex flex-wrap gap-2">
                {SOCIAL_LINKS.map((link) => (
                  <FooterPill key={link.href} href={link.href} external>
                    <link.icon size={13} />
                    {link.label}
                  </FooterPill>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col-reverse items-start justify-between gap-4 border-t border-black/10 pt-6 text-xs tracking-widest text-black/40 uppercase sm:flex-row sm:items-center dark:border-white/10 dark:text-white/40">
          <p className="dot-font font-doto">© {new Date().getFullYear()} Dennis Cortes</p>
          <p className="dot-font font-doto">Design / Music / Photo / Code</p>
        </div>
      </div>
    </footer>
  );
}
