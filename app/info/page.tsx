import Link from "next/link";
import { Instagram, Linkedin } from "lucide-react";
import PrimaryNav from "@/components/ui/PrimaryNav";
import PageHeader from "@/components/ui/PageHeader";

// Same real social links used in the footer's "/ Social" group — kept in
// sync by hand since this is the only other place they're needed.
const CONTACT_LINKS = [
  { label: "Instagram", href: "https://www.instagram.com/shyboytm/", icon: Instagram },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/fromcortes/", icon: Linkedin },
];

// Replaces the old standalone /about page and the placeholder "Contact" nav
// link — this single page now covers both "who is Dennis" and "how do I
// reach him".
export default function InfoPage() {
  return (
    <div className="pt-32 pb-24">
      <PrimaryNav />

      <div className="m-auto w-full max-w-3xl px-6 md:px-10">
        <PageHeader title="Info" subtitle="Software Product Designer" />

        <div className="space-y-4">
          <p className="text-lg leading-relaxed text-black/80 dark:text-white/80">
            I currently work at Aboon, and I was most recently a designer at Instagram on the Growth
            Web team. Outside of work, I build the game journaling app GamePal, I create music as
            Cordio &amp; Horizon Radar, restore and mod old game consoles, and take photos.
          </p>
          <p className="text-lg leading-relaxed text-black/80 dark:text-white/80">
            I specialize in product design for both web and mobile apps and thrive in 0 → 1 work. My
            expertise is in design leadership, visual design, user experience, and design systems. I
            also have a background in engineering, with a focus on React, CSS architecture, and
            component systems.
          </p>
          <p className="text-lg leading-relaxed text-black/80 dark:text-white/80">
            I&apos;m currently available for full time and contract design roles for early stage
            startups and sound/music design projects for games, apps, podcasts, and films.
          </p>
          <p className="text-lg leading-relaxed text-black/80 dark:text-white/80">
            I produce music under the alias Cordio, and create tracks for films, shows, and
            podcasts. Listen to all my music anywhere you stream music, or snag some on my Bandcamp.
          </p>
        </div>

        <div className="mt-14 border-t border-black/10 pt-8 dark:border-white/10">
          <h2 className="dot-font mb-4 font-doto text-xs tracking-widest text-black/40 uppercase dark:text-white/40">
            / Contact
          </h2>
          <div className="flex flex-wrap gap-2">
            {CONTACT_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-black/10 px-4 py-2 text-xs tracking-widest text-black/70 uppercase transition-colors hover:border-black/30 hover:text-black dark:border-white/10 dark:text-white/70 dark:hover:border-white/30 dark:hover:text-white"
              >
                <link.icon size={13} />
                <span className="inline-block translate-y-[1px]">{link.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
