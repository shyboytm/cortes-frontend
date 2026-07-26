import Link from "next/link";

const MARQUEE_PHRASE = Array.from({ length: 1 }, () => "Let's Chat // Contact // HMU // Emailsss // ").join(" / ");

export default function WorkTogetherCTA() {
  return (
    <div className="relative z-10 mx-6 mt-6 flex h-48 items-center justify-center overflow-hidden bg-white/40 dark:bg-black/40 rounded-2xl border border-black/10 sm:h-64 dark:border-white/10">

      <div
        aria-hidden
        className="marquee-track absolute inset-y-0 left-0 z-0 flex items-center whitespace-nowrap"
      >
        <span className="dot-font shrink-0 pr-12 font-doto-marquee font-bold tracking-tight text-black/[0.05] uppercase text-8xl lg:text-[240px] dark:text-white/[0.08]">
          {MARQUEE_PHRASE}
        </span>
        <span className="dot-font shrink-0 pr-12 font-doto-marquee font-bold tracking-tight text-black/[0.05] uppercase text-8xl lg:text-[240px] dark:text-white/[0.08]">
          {MARQUEE_PHRASE}
        </span>
      </div>

      <Link
        href="mailto:hi@cortes.us"
        data-cuelume-hover="tick"
        data-cuelume-press
        className="cta-gradient-hover uppercase relative z-10 rounded-full bg-black px-8 py-4 text-base tracking-wide text-white transition-transform hover:scale-105 sm:text-lg dark:bg-white dark:text-black"
      >
        hi@cortes.us
      </Link>
    </div>
  );
}
