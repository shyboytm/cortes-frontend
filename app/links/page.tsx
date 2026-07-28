import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { Briefcase, Music, Newspaper, ShoppingBag, Globe } from "lucide-react";
import { SiYoutube, SiBuymeacoffee } from "@icons-pack/react-simple-icons";
import PrimaryNav from "@/components/ui/PrimaryNav";
import { SOCIAL_LINKS } from "@/lib/social-links";
import { buildMetadata } from "@/lib/page-meta";
import { SITE_URL, DEFAULT_OG_IMAGE } from "@/lib/site-config";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: "Links",
    description: "Everywhere else to find Dennis Cortés, all in one place.",
    imageUrl: DEFAULT_OG_IMAGE,
    path: "/links",
  });
}

const MAIN_LINKS = [
  {
    label: "Cordio Music",
    description: "Listen to my music on any streaming platform or Bandcamp",
    href: "/music",
    icon: Music,
    external: true,
  },
  {
    label: "Work",
    description: "Product design case studies and projects",
    href: "/work",
    icon: Briefcase,
  },
  {
    label: "Shop",
    description: "Merch and other things I've made",
    href: "/shop",
    icon: ShoppingBag,
  },
  {
    label: "Writing",
    description: "Notes on design, code, music, and whatever else",
    href: "/writing",
    icon: Newspaper,
  },
  {
    label: "YouTube",
    description: "Videos on design, code, music, and more",
    href: "https://www.youtube.com/cortesarts",
    icon: SiYoutube,
    external: true,
  },
  {
    label: "Buy Me a Coffee",
    description: "Support my work directly",
    href: "https://buymeacoffee.com/cortes",
    icon: SiBuymeacoffee,
    external: true,
  },
  {
    label: "Website",
    description: "The rest of my site",
    href: SITE_URL,
    icon: Globe,
    external: true,
  },
];

export default function LinksPage() {
  return (
    <div className="pt-32 pb-24">
      <PrimaryNav />

      <div className="m-auto flex w-full max-w-xl flex-col items-center px-6 text-center">
        <div className="relative h-20 w-20 overflow-hidden rounded-full border border-black/10 dark:border-white/10">
          <Image
            src="/info-portrait-dennis-cortes.jpeg"
            alt="Dennis Cortes"
            fill
            className="object-cover object-top-right"
            sizes="64px"
          />
        </div>

        <h1 className="mt-4 text-xl text-black dark:text-white">Dennis Cortés</h1>
        <p className="mt-1 text-sm text-black/60 dark:text-white/60">Designer, musician, &amp; photographer</p>

        <div className="mt-7 flex flex-wrap justify-center gap-6">
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

        <div className="mt-10 flex w-full flex-col gap-3">
          {MAIN_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              data-cuelume-hover="tick"
              data-cuelume-press
              {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="group flex items-center gap-5 rounded-md border border-black/10 bg-black/[0.03] px-5 py-4 text-left transition-colors hover:bg-black/[0.06] dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-white/[0.06]"
            >
              <link.icon size={20} className="svg-shadow shrink-0 text-black/70 dark:text-white/70" />
              <span className="flex flex-col gap-1 overflow-hidden">
                <span className="text-base text-black dark:text-white">{link.label}</span>
                <span className="truncate text-xs text-black/60 dark:text-white/60">{link.description}</span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
