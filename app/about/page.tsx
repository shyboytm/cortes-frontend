import PrimaryNav from "@/components/ui/PrimaryNav";
import PageHeader from "@/components/ui/PageHeader";

export default function AboutPage() {
  return (
    <div className="pt-32 pb-24">
      <PrimaryNav />

      <div className="m-auto w-full max-w-3xl px-6 md:px-10">
        <PageHeader title="About" subtitle="Software Product Designer" />

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
      </div>
    </div>
  );
}
