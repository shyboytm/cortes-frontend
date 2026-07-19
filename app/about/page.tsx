import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { type SanityDocument } from "next-sanity";
import { client, sanityFetchOptions } from "@/sanity/client";
import PrimaryNav from "@/components/ui/PrimaryNav";
import PageHeader from "@/components/ui/PageHeader";
import InteractivePortrait from "@/components/ui/InteractivePortrait";
import ClientsSection from "@/components/ui/ClientsSection";
import PressSection from "@/components/ui/PressSection";
import ExperienceSection from "@/components/ui/ExperienceSection";
import { buttonVariants } from "@/components/ui/button";
import { SOCIAL_LINKS } from "@/lib/social-links";

// Photos that rotate through the portrait; InteractivePortrait controls the cycle interval.
const PORTRAIT_PHOTOS = [
  "/info-portrait-dennis-cortes.jpeg",
  "/info-portrait-dennis-cortes-2.jpeg",
  "/info-portrait-dennis-cortes-3.jpeg",
  "/info-portrait-dennis-cortes-4.jpeg",
  "/info-portrait-dennis-cortes-5.jpeg",
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

const options = sanityFetchOptions(900);

export default async function AboutPage() {
  const [services, testimonials] = await Promise.all([
    client.fetch<SanityDocument[]>(SERVICES_QUERY, {}, options),
    client.fetch<SanityDocument[]>(TESTIMONIALS_QUERY, {}, options),
  ]);

  return (
    <div className="pt-32 pb-24">
      <PrimaryNav />

      <div className="m-auto w-full px-6">
        <PageHeader
          title="About"
          subtitle={
            <Link
              href="mailto:hi@cortes.us"
              className="transition-colors link-underline hover:text-black dark:hover:text-white"
            >
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
              <h2 className="dot-font mb-4 font-doto text-xs tracking-widest text-black/60 uppercase dark:text-white/60">
                / Socials
              </h2>
              <div className="flex flex-wrap gap-2 max-w-lg">
                {SOCIAL_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={buttonVariants({ variant: "secondary", size: "sm" })}
                  >
                    <link.icon size={12} className="svg-shadow" />
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {services.length > 0 && (
              <div className="mt-14 max-w-3xl border-t border-black/10 pt-8 dark:border-white/10">
                <h2 className="dot-font mb-6 font-doto text-xs tracking-widest text-black/60 uppercase dark:text-white/60">
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

            <ClientsSection />
            <PressSection />
          </div>

          <InteractivePortrait
            src={PORTRAIT_PHOTOS}
            alt="Dennis Cortes"
            className="lg:sticky lg:top-32"
          />
        </div>

        <ExperienceSection />

        {testimonials.length > 0 && (
          <div className="mt-14 border-t border-black/10 pt-8 dark:border-white/10">
            <div className="mt-6 mb-12 flex flex-wrap items-center justify-between gap-4">
              <h2 className="text-2xl font-normal tracking-wide text-black dark:text-white">What Others Say</h2>
              <Link
                href={SOCIAL_LINKS.find((link) => link.label === "LinkedIn")!.href}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonVariants({ variant: "secondary", size: "sm" })}
              >
                See more on LinkedIn
                <ArrowUpRight size={14} className="svg-shadow" />
              </Link>
            </div>
            <div className="columns-1 gap-x-10 lg:columns-2">
              {testimonials.map((testimonial) => (
                <figure
                  key={testimonial._id}
                  className="mb-5 flex w-full flex-col items-start gap-1.5 break-inside-avoid"
                >
                  <blockquote className="w-full rounded-2xl rounded-bl-xs bg-black/5 p-4 text-base leading-relaxed whitespace-pre-line text-black/80 dark:bg-white/10 dark:text-white/80">
                    {testimonial.quote}
                  </blockquote>
                  <figcaption className="dot-font ml-1 font-doto text-[10px] tracking-widest text-black/60 uppercase dark:text-white/60">
                    {testimonial.name}
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
