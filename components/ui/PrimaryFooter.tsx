import Image from "next/image";
import Link from "next/link";
import { Copyright } from "lucide-react";
import FooterScene from "@/components/ui/FooterScene";
import GlobeIcon from "@/components/ui/GlobeIcon";
import WorkTogetherCTA from "@/components/ui/WorkTogetherCTA";
import ViewportSize from "@/components/ui/ViewportSize";
import NashvilleStatus from "@/components/ui/NashvilleStatus";
import NowPlaying from "@/components/ui/NowPlaying";
import NewsletterSignup from "@/components/ui/NewsletterSignup";
import { SOCIAL_LINKS } from "@/lib/social-links";

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

export default function PrimaryFooter() {
  return (
    <footer className="relative overflow-hidden">
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
              />
            </div>

            <NowPlaying />
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:col-span-7">
            <NewsletterSignup />

            <div>
              <p className="dot-font mb-4 font-doto text-xs tracking-widest text-black/60 uppercase dark:text-white/60">
                / Social
              </p>
              <div className="flex flex-wrap gap-5">
                {SOCIAL_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={link.label}
                    data-cuelume-hover="tick"
                    data-cuelume-press
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
          <p className="dot-font font-doto flex items-center gap-1.5">
            <Copyright size={14} className="svg-shadow shrink-0" />
            <span>{new Date().getFullYear()} Dennis Cortes</span>
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
