import Link from "next/link";
import NavDotGrid from "./NavDotGrid";

// Repeated once here (rather than relying on the container to space things
// out) so each of the two marquee copies below is fully self-contained,
// including its own trailing separator — that's what lets them sit directly
// adjacent with zero gap, which is what makes the -50% loop seamless.
const MARQUEE_PHRASE = Array.from({ length: 1 }, () => "Let's Chat // Contact // HMU // Emailsss // ").join(" / ");

// Sits at the top of the footer on every page: a big, low-opacity phrase
// scrolling behind a centered mailto button. Purely decorative background
// text, so it's hidden from screen readers — the actual email link is the
// only interactive/meaningful part.
export default function WorkTogetherCTA() {
  return (
    <div className="relative z-10 mx-6 mt-6 flex h-48 items-center justify-center overflow-hidden bg-white/20 dark:bg-black/20 rounded-2xl border border-black/10 sm:h-64 dark:border-white/10">

      <NavDotGrid />

      <div
        aria-hidden
        className="marquee-track absolute inset-y-0 left-0 z-0 flex items-center whitespace-nowrap"
      >
        <span className="dot-font shrink-0 pr-12 font-doto text-6xl font-bold tracking-tight text-black/[0.05] uppercase sm:text-8xl lg:text-[240px] dark:text-white/[0.08]">
          {MARQUEE_PHRASE}
        </span>
        <span className="dot-font shrink-0 pr-12 font-doto text-6xl font-bold tracking-tight text-black/[0.05] uppercase sm:text-8xl lg:text-[240px] dark:text-white/[0.08]">
          {MARQUEE_PHRASE}
        </span>
      </div>

      <Link
        href="mailto:hi@cortes.us"
        className="relative z-10 rounded-full bg-black px-8 py-4 text-base tracking-wide text-white transition-transform hover:scale-105 sm:text-lg dark:bg-white dark:text-black"
      >
        hi@cortes.us
      </Link>
    </div>
  );
}
