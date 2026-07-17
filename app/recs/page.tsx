import Link from "next/link";
import { type SanityDocument } from "next-sanity";
import { Compass, BookOpen, Mic, Video, Newspaper, Smartphone, Music, Package, Globe, type LucideIcon } from "lucide-react";
import { SiBuymeacoffee } from "@icons-pack/react-simple-icons";
import { client } from "@/sanity/client";
import { urlFor } from "@/sanity/image";
import PrimaryNav from "@/components/ui/PrimaryNav";
import PageHeader from "@/components/ui/PageHeader";
import RecRow, { type Platform } from "@/components/ui/RecRow";
import StickySubNav from "@/components/ui/StickySubNav";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const RECS_QUERY = `*[
  _type == "recommendation"
]{
  _id,
  title,
  category,
  description,
  url,
  order,
  platform,
  likes,
  image{
    alt,
    asset
  },
  hoverPreview{
    alt,
    asset
  }
}`;

const options = { next: { revalidate: 30 } };

// Fixed display order regardless of how Sanity happens to return them —
// alphabetical by label.
const CATEGORY_SECTIONS: { value: string; label: string; icon: LucideIcon }[] = [
  { value: "app", label: "Apps", icon: Smartphone },
  { value: "blog", label: "Blogs & Articles", icon: Newspaper },
  { value: "book", label: "Books", icon: BookOpen },
  { value: "gear", label: "Gear", icon: Package },
  { value: "music", label: "Music", icon: Music },
  { value: "podcast", label: "Podcasts", icon: Mic },
  { value: "resource", label: "Resources", icon: Compass },
  { value: "video", label: "Videos", icon: Video },
  { value: "website", label: "Websites", icon: Globe },
];

export default async function RecsPage() {
  const recs = await client.fetch<SanityDocument[]>(RECS_QUERY, {}, options);

  // Lower `order` first, undefined/blank order falls back to newest-first —
  // same convention as Work and Feed.
  const sorted = [...recs].sort((a, b) => {
    if (a.order != null && b.order != null) return a.order - b.order;
    if (a.order != null) return -1;
    if (b.order != null) return 1;
    return 0;
  });

  // Group once so the jump nav and the sections below agree on exactly
  // which categories actually have content.
  const sections = CATEGORY_SECTIONS.map((section) => ({
    ...section,
    items: sorted.filter((rec) => rec.category === section.value),
  })).filter((section) => section.items.length > 0);

  return (
    <div className="pt-32 pb-24">
      <PrimaryNav />

      <div className="px-6">
        <PageHeader
          title="Recs"
          subtitle="Things I think are cool or useful, and want to share with other people."
        />

        {sections.length === 0 ? (
          <p className="text-black/60 dark:text-white/60">
            Nothing here yet — add a recommendation in Sanity to get started.
          </p>
        ) : (
          <>
            <nav
              aria-label="Jump to section"
              className="mb-12 flex flex-wrap gap-2 border-b border-black/10 pb-8 dark:border-white/10"
            >
              {sections.map(({ value, label, icon: Icon }) => (
                <a
                  key={value}
                  href={`#${value}`}
                  className={buttonVariants({ variant: "secondary", size: "sm" })}
                >
                  <Icon size={14} />
                  {label}
                </a>
              ))}
            </nav>
            {/* Marks where the in-page jump nav ends — StickySubNav watches
                this via IntersectionObserver and mirrors the same links
                into a bar under PrimaryNav once it scrolls out of view. */}
            <div id="recs-nav-sentinel" />
            <StickySubNav sentinelId="recs-nav-sentinel" ariaLabel="Jump to section">
              {sections.map(({ value, label, icon: Icon }) => (
                <a
                  key={value}
                  href={`#${value}`}
                  className={buttonVariants({ variant: "secondary", size: "sm" })}
                >
                  <Icon size={14} />
                  {label}
                </a>
              ))}
            </StickySubNav>

            {sections.map(({ value, label, icon: Icon, items }) => (
              <div key={value} id={value} className="mb-12 scroll-mt-32">
                <h2 className="dot-font mb-2 flex items-center gap-2 font-doto text-xs tracking-widest text-black/60 uppercase dark:text-white/60">
                  <Icon size={14} />/ {label}
                </h2>
                <ul className="grid grid-cols-1 gap-x-8 md:grid-cols-2">
                  {items.map((rec) => (
                    <RecRow
                      key={rec._id}
                      id={rec._id}
                      title={rec.title}
                      description={rec.description}
                      url={rec.url}
                      platform={rec.platform as Platform | undefined}
                      likes={rec.likes}
                      imageUrl={
                        rec.image?.asset
                          ? urlFor(rec.image.asset).width(96).height(96).fit("crop").url()
                          : undefined
                      }
                      imageAlt={rec.image?.alt}
                      imageVariant={value === "music" ? "cd" : undefined}
                      hoverPreviewUrl={
                        rec.hoverPreview?.asset
                          ? urlFor(rec.hoverPreview.asset).width(720).fit("max").url()
                          : undefined
                      }
                      hoverPreviewAlt={rec.hoverPreview?.alt}
                    />
                  ))}
                </ul>
              </div>
            ))}

            <div className="mx-auto mt-6 max-w-3xl rounded-xl border border-black/10 bg-black/[0.03] p-6 text-center dark:border-white/10 dark:bg-white/[0.03]">
              <p className="text-xs leading-relaxed text-black/60 dark:text-white/60">
                Links here may contain affiliate links, which support me as a creator through
                the projects and teaching mediums I work on. However, no one has paid me to put
                any of these on this list and I genuinely recommend all of these.
              </p>
              <p className="mt-3 text-xs leading-relaxed text-black/60 dark:text-white/60">
                If you find this site useful, consider supporting me directly instead.
              </p>
              <Link
                href="https://buymeacoffee.com/cortes"
                target="_blank"
                rel="noopener noreferrer"
                className={cn(buttonVariants({ variant: "secondary", size: "sm" }), "mt-4")}
              >
                <SiBuymeacoffee size={16} />
                Buy Me a Coffee
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
