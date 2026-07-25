import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import {client, sanityFetchOptions} from "@/sanity/client";
import {WORK_QUERY} from "@/sanity/queries";
import PrimaryNav from "@/components/ui/PrimaryNav";
import WorkGrid, {type WorkGridItem} from "@/components/ui/WorkGrid";
import GlobeIcon from "@/components/ui/GlobeIcon";
import { buttonVariants } from "@/components/ui/button";
import { resolvePageMetadata } from "@/lib/page-meta";

const options = sanityFetchOptions(30);

export async function generateMetadata(): Promise<Metadata> {
  return resolvePageMetadata(
    "home",
    {
      title: "Dennis Cortés - Designer & Music Producer",
      description: "Software Designer, Musician, and Photographer based in Nashville, TN",
    },
    "/"
  );
}

export default async function IndexPage() {
  const workItems = await client.fetch<WorkGridItem[]>(WORK_QUERY, {}, options);

  return (
    <div id="home" className="pt-32">
      
      <PrimaryNav></PrimaryNav>
      
      <div id="main-content" className="m-auto w-full px-6">

        <div className="dot-font mb-6 flex flex-col gap-3 py-4 font-doto text-black dark:text-white">
          <div className="flex items-center gap-2 tracking-widest text-black/70 dark:text-white/60">
            <GlobeIcon className="h-3.5 w-auto mr-2 svg-shadow" />
            <span className="text-sm">36.162° N, 86.781° W</span>
          </div>

          <div className="flex flex-wrap items-center gap-3  tracking-widest uppercase">
            <span className="group text-blue-900 dark:text-blue-400">
              <span className="grid group-hover:hidden">設計</span>
              <span className="hidden group-hover:grid">Design</span>
            </span>
            <span className="text-black/20 dark:text-white/20">/</span>
            <span className="group text-green-800 dark:text-green-400">
              <span className="grid group-hover:hidden">音楽</span>
              <span className="hidden group-hover:grid">Music</span>
            </span>
            <span className="text-black/20 dark:text-white/20">/</span>
            <span className="group text-red-900 dark:text-red-400">
              <span className="grid group-hover:hidden">写真撮影</span>
              <span className="hidden group-hover:grid">Photo</span>
            </span>
            <span className="text-black/20 dark:text-white/20">/</span>
            <span className="group text-amber-800 dark:text-amber-400">
              <span className="grid group-hover:hidden">コード</span>
              <span className="hidden group-hover:grid">Code</span>
            </span>
          </div>
        </div>

        <div className="font-light my-6 space-y-4 sm:text-5xl max-w-5xl text-3xl leading-[1.25] pb-6 dark:text-white/80 ">
          <h2 className="mb-12">I&apos;m a software designer, musician, and photographer. Currently a Principal Designer at <Link className="link-underline opacity-50" data-cuelume-hover="tick" href="https://www.aboon.com">Aboon</Link>, previously at <Link className="link-underline opacity-50" data-cuelume-hover="tick" href="https://www.instagram.com">Instagram</Link>.</h2>
          <h2 className="mb-12">Outside of work, I build <Link className="link-underline opacity-50" data-cuelume-hover="tick" href="https://apple.co/4gUqHBR">GamePal</Link>, restore and mod old consoles, take photos, and make music as <Link className="link-underline opacity-50" data-cuelume-hover="tick" href="#">Cordio</Link> and <Link className="link-underline opacity-50" data-cuelume-hover="tick" href="#">Horizon Radar</Link> which you can stream anywhere or support me on <Link className="link-underline opacity-50" data-cuelume-hover="tick" href="https://cordio.bandcamp.com">Bandcamp</Link>.</h2>
        </div>

      </div>

      <div
        id="work"
        className="mt-14 border-t border-black/10 px-6 pt-8 pb-24 dark:border-white/10"
      >
        <div className="mt-6 mb-6 flex items-center justify-between gap-4">
          <h2 className="text-2xl font-normal tracking-wide text-black dark:text-white">Featured Projects</h2>
          <Link
            href="/work"
            data-cuelume-hover="tick"
            data-cuelume-press
            className={buttonVariants({ variant: "secondary", size: "sm" })}
          >
            View All
            <ArrowRight size={16} />
          </Link>
        </div>

        <WorkGrid workItems={workItems} />
      </div>

    </div>
  );
}
