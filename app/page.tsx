import Link from "next/link";
import {type SanityDocument} from "next-sanity";
import {client} from "@/sanity/client";
import { Button } from "@/components/ui/button"
import PrimaryNav from "@/components/ui/PrimaryNav";
import WorkRow from "@/components/ui/WorkRow";
import GlobeIcon from "@/components/ui/GlobeIcon";
// import Image from 'next/image'
// import { Mailbox } from 'lucide-react';
// import type {SimpleIcon} from 'simple-icons';

const POSTS_QUERY = `*[
  _type == "post"
  && defined(slug.current)
]|order(publishedAt desc)[0...12]{_id, title, slug, publishedAt}`;

const WORK_QUERY = `*[
  _type == "work"
  && defined(slug.current)
]|order(order asc, _createdAt desc){
  _id,
  title,
  dateRange,
  slug,
  photos[]{
    _key,
    alt,
    asset,
    "aspectRatio": asset->metadata.dimensions.aspectRatio
  }
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
      
      <div id="main-content" className="m-auto w-full px-12">

        {/* <div className="my-6">
          <Link href="https://www.instagram.com/shyboytm/">
            <div className="bg-black/10 dark:bg-white/10 inline-block opacity-75 hover:opacity-100 p-4 rounded-full transition-opacity">
              <Mailbox size={24} />
            </div>
          </Link>
          <Link href="https://www.instagram.com/shyboytm/">
            <div className="bg-black/10 dark:bg-white/10 inline-block opacity-75 hover:opacity-100 p-4 rounded-full transition-opacity">
              <img height="24" width="24" src="https://cdn.simpleicons.org/instagram/black" />
            </div>
          </Link>
          <Link href="https://www.linkedin.com/in/fromcortes/">
            <div className="bg-black/10 dark:bg-white/10 inline-block opacity-75 hover:opacity-100 p-4 rounded-full transition-opacity">
              <img height="24" width="24" src="https://cdn.simpleicons.org/linkedin/black" />
            </div>
          </Link>
          <Link href="https://www.instagram.com/shyboytm/">
            <div className="bg-black/10 dark:bg-white/10 inline-block opacity-75 hover:opacity-100 p-4 rounded-full transition-opacity">
              <img height="24" width="24" src="https://cdn.simpleicons.org/instagram/black" />
            </div>
          </Link>
        </div> */}

        <div className="dot-font mb-6 flex flex-col gap-3 py-4 font-doto text-black dark:text-white">
          <div className="flex items-center gap-2 tracking-widest text-black/70 dark:text-white/50">
            <GlobeIcon className="h-3.5 w-auto mr-2" />
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

        <div className="font-light my-6 space-y-4 text-6xl leading-20 text-black dark:text-white/80 ">
          <h2 className="mb-12">I'm a Principal Product Designer at Aboon, previously at Instagram on the Growth Web team.</h2>
          <h2 className="mb-12">Outside of work, I build GamePal, restore and mod old consoles, take photos, and make music as <Link className="underline" href="#">Cordio</Link> and <Link className="underline" href="#">Horizon Radar</Link> — you can stream it anywhere or grab it on Bandcamp.</h2>
          <h2 className="mb-12">I'm available for design consulting at early-stage startups, or sound design and music projects for video games, apps, podcasts, and films.</h2>
        </div>

        <Button>Testing</Button>
        <Button variant="outline">Testing</Button>

        <ul>
          {posts.map((post) => (
            <li key={post._id}>
              <Link href={`/posts/${post.slug.current}`}>
                 {/* <Image
                    src={post.image}
                    width={500}
                    height={500}
                    alt="Picture of the author"
                  /> */}
                <h2>{post.title}</h2>
                <p>{new Date(post.publishedAt).toLocaleDateString()}</p>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div id="work">
        {workItems.map((work) => (
          <WorkRow
            key={work._id}
            title={work.title}
            dateRange={work.dateRange}
            photos={work.photos}
          />
        ))}
      </div>

    </div>
  );
}
