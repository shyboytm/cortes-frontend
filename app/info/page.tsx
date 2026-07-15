import Link from "next/link";
import { Instagram, Linkedin } from "lucide-react";
import {
  SiPatreon,
  SiX,
  SiDribbble,
  SiYoutube,
  SiBuymeacoffee,
} from "@icons-pack/react-simple-icons";
import { type SanityDocument } from "next-sanity";
import { client } from "@/sanity/client";
import PrimaryNav from "@/components/ui/PrimaryNav";
import PageHeader from "@/components/ui/PageHeader";
import InteractivePortrait from "@/components/ui/InteractivePortrait";
import { buttonVariants } from "@/components/ui/button";

// Same real social links used in the footer's "/ Social" group — kept in
// sync by hand since this is the only other place they're needed.
const CONTACT_LINKS = [
  { label: "Instagram", href: "https://www.instagram.com/shyboytm/", icon: Instagram },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/fromcortes/", icon: Linkedin },
  { label: "X", href: "https://x.com/shyboytm", icon: SiX },
  { label: "Dribbble", href: "https://dribbble.com/shyboytm", icon: SiDribbble },
  { label: "YouTube", href: "https://www.youtube.com/cortesarts", icon: SiYoutube },
  { label: "Patreon", href: "https://www.patreon.com/c/shyboytm", icon: SiPatreon },
  { label: "Buy Me a Coffee", href: "https://buymeacoffee.com/cortes", icon: SiBuymeacoffee },
];

const SERVICES_QUERY = `*[
  _type == "service"
] | order(order asc, _createdAt asc){
  _id, title, description
}`;

const TESTIMONIALS_QUERY = `*[
  _type == "testimonial"
] | order(order asc, _createdAt asc){
  _id, quote, name, role
}`;

const options = { next: { revalidate: 30 } };

// Replaces the old standalone /about page and the placeholder "Contact" nav
// link — this single page now covers both "who is Dennis" and "how do I
// reach him", plus the Services and testimonials Sanity content below.
export default async function InfoPage() {
  const [services, testimonials] = await Promise.all([
    client.fetch<SanityDocument[]>(SERVICES_QUERY, {}, options),
    client.fetch<SanityDocument[]>(TESTIMONIALS_QUERY, {}, options),
  ]);

  return (
    <div className="pt-32 pb-24">
      <PrimaryNav />

      <div className="m-auto w-full px-6">
        <PageHeader
          title="Info"
          subtitle={
            <Link href="mailto:hi@cortes.us" className="transition-colors link-underline hover:text-black dark:hover:text-white">
              hi@cortes.us
            </Link>
          }
        />

        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[1fr_320px] lg:gap-16">
          <div>
            <div className="space-y-4 max-w-3xl">
              <p className="text-lg leading-relaxed text-black/80 dark:text-white/80">
                I currently work at Aboon, and I was most recently a designer at Instagram on the
                Growth Web team. Outside of work, I build the game journaling app GamePal, I create
                music as Cordio &amp; Horizon Radar, restore and mod old game consoles, and take
                photos.
              </p>
              <p className="text-lg leading-relaxed text-black/80 dark:text-white/80">
                I specialize in product design for both web and mobile apps and thrive in 0 → 1
                work. My expertise is in design leadership, visual design, user experience, and
                design systems. I also have a background in engineering, with a focus on React, CSS
                architecture, and component systems.
              </p>
              <p className="text-lg leading-relaxed text-black/80 dark:text-white/80">
                I&apos;m currently available for full time and contract design roles for early stage
                startups and sound/music design projects for games, apps, podcasts, and films.
              </p>
              <p className="text-lg leading-relaxed text-black/80 dark:text-white/80">
                I produce music under the alias Cordio, and create tracks for films, shows, and
                podcasts. Listen to all my music anywhere you stream music, or snag some on my
                Bandcamp.
              </p>
            </div>

            <div className="mt-14 max-w-3xl border-t border-black/10 pt-8 dark:border-white/10">
              <h2 className="dot-font mb-4 font-doto text-xs tracking-widest text-black/40 uppercase dark:text-white/40">
                / Socials
              </h2>
              <div className="flex flex-wrap gap-2">
                {CONTACT_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={buttonVariants({ variant: "secondary", size: "sm" })}
                  >
                    <link.icon size={13} />
                    <span className="inline-block translate-y-[1px]">{link.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            {services.length > 0 && (
              <div className="mt-14 max-w-3xl border-t border-black/10 pt-8 dark:border-white/10">
                <h2 className="dot-font mb-6 font-doto text-xs tracking-widest text-black/40 uppercase dark:text-white/40">
                  / Services
                </h2>
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  {services.map((service) => (
                    <div key={service._id}>
                      <h3 className="text-lg font-normal tracking-wide text-black dark:text-white">
                        {service.title}
                      </h3>
                      <p className="mt-1 text-sm leading-relaxed text-black/60 dark:text-white/60">
                        {service.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <InteractivePortrait
            src="/info-portrait-dennis-cortes.jpeg"
            alt="Dennis Cortes"
            className="lg:sticky lg:top-32"
          />
        </div>

        {testimonials.length > 0 && (
          <div className="mt-14 border-t border-black/10 pt-8 dark:border-white/10">
            <h2 className="mb-6 text-3xl font-normal tracking-wide text-black dark:text-white">What Others Say</h2>
            <div className="grid grid-cols-1 gap-x-10 gap-y-10 lg:grid-cols-2">
              {testimonials.map((testimonial) => (
                <figure key={testimonial._id}>
                  <blockquote className="text-base leading-relaxed whitespace-pre-line text-black/70 italic dark:text-white/70">
                    &ldquo;{testimonial.quote}&rdquo;
                  </blockquote>
                  <figcaption className="dot-font mt-3 font-doto text-xs tracking-widest text-black/40 uppercase dark:text-white/40">
                    &mdash; {testimonial.name}
                    {testimonial.role ? `, ${testimonial.role}` : ""}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
