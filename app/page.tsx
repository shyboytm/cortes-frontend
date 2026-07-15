import Link from "next/link";
import {type SanityDocument} from "next-sanity";
import {client} from "@/sanity/client";
import PrimaryNav from "@/components/ui/PrimaryNav";
import WorkRow from "@/components/ui/WorkRow";
import GlobeIcon from "@/components/ui/GlobeIcon";
import ClientsSection from "@/components/ui/ClientsSection";
import PressSection from "@/components/ui/PressSection";

const POSTS_QUERY = `*[
  _type == "post"
  && defined(slug.current)
]|order(publishedAt desc)[0...5]{_id, title, slug, publishedAt}`;

const WORK_QUERY = `*[
  _type == "work"
  && defined(slug.current)
]|order(order asc, _createdAt desc){
  _id,
  title,
  dateRange,
  slug,
  mainImage{
    alt,
    asset
  },
  hoverImage{
    alt,
    asset
  },
  "hasCaseStudy": count(caseStudy) > 0
}`;

const options = {next: {revalidate: 30}};

export default async function IndexPage() {
  const [posts, workItems] = await Promise.all([
    client.fetch<SanityDocument[]>(POSTS_QUERY, {}, options),
    client.fetch<SanityDocument[]>(WORK_QUERY, {}, options),
  ]);

  return (
    <div id="home" className="pt-32">
      
      <PrimaryNav></PrimaryNav>
      
      <div id="main-content" className="m-auto w-full px-6">

        <div className="dot-font mb-6 flex flex-col gap-3 py-4 font-doto text-black dark:text-white">
          <div className="flex items-center gap-2 tracking-widest text-black/70 dark:text-white/60">
            <GlobeIcon className="h-3.5 w-auto mr-2 svg-shadow" />
            <span>36.1627° N, 86.7816° W</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 tracking-widest uppercase">
            <span className="text-blue-800 dark:text-blue-400">Design</span>
            <span className="text-black/20 dark:text-white/20">/</span>
            <span className="text-green-800 dark:text-green-400">Music</span>
            <span className="text-black/20 dark:text-white/20">/</span>
            <span className="text-red-800 dark:text-red-400">Photo</span>
            <span className="text-black/20 dark:text-white/20">/</span>
            <span className="text-amber-800 dark:text-amber-400">Code</span>
          </div>
        </div>

        <div className="font-light my-6 space-y-4 sm:text-5xl text-4xl leading-[1.25] border-b border-black/10 pb-6 dark:border-white/10 dark:text-white/80 ">
          <h2 className="mb-12">I'm a software designer, musician, and photographer. Currently a Principal Designer at <Link className="link-underline opacity-50" href="https://www.aboon.com">Aboon</Link>, previously at <Link className="link-underline opacity-50" href="https://www.instagram.com">Instagram</Link>.</h2>
          <h2 className="mb-12">Outside of work, I build <Link className="link-underline opacity-50" href="https://apple.co/4gUqHBR">GamePal</Link>, restore and mod old consoles, take photos, and make music as <Link className="link-underline opacity-50" href="#">Cordio</Link> and <Link className="link-underline opacity-50" href="#">Horizon Radar</Link> which you can stream anywhere or support me on <Link className="link-underline opacity-50" href="https://cordio.bandcamp.com">Bandcamp</Link>.</h2>
        </div>

      </div>

      <div className="px-6">
        <ClientsSection />
        <PressSection />
      </div>

      <div
        id="work"
        className="grid grid-cols-1 gap-x-8 gap-y-12 px-6 pt-6 pb-24 sm:grid-cols-2 lg:grid-cols-3"
      >
        <h1 className="col-span-full text-4xl font-normal text-black dark:text-white">Featured Work</h1>

        {workItems.map((work) => (
          <WorkRow
            key={work._id}
            title={work.title}
            dateRange={work.dateRange}
            mainImage={work.mainImage}
            hoverImage={work.hoverImage}
            slug={work.slug?.current}
            hasCaseStudy={work.hasCaseStudy}
          />
        ))}
      </div>

    </div>
  );
}
