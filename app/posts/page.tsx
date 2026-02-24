import Link from "next/link";
import {type SanityDocument} from "next-sanity";
import {client} from "@/sanity/client";
import Button from "@/components/ui/Button";
import PrimaryNav from "@/components/ui/PrimaryNav";
import Image from 'next/image'

const POSTS_QUERY = `*[
  _type == "post"
  && defined(slug.current)
]|order(publishedAt desc)[0...12]{_id, title, slug, publishedAt}`;

const options = {next: {revalidate: 30}};

export default async function IndexPage() {
  const posts = await client.fetch<SanityDocument[]>(POSTS_QUERY, {}, options);

  return (
    <main className="gradient-background">
      <div id="main-content" className="ml-16 w-3xl">

        <PrimaryNav></PrimaryNav>

        <div className="flex text-xl flex-col items-start gap-2">
          <h1 className="font-semibold">Blog</h1>
          <h2 className="font-normal">Software Product Designer</h2>
        </div>

        <div className="font-mono opacity-75 mt-6 space-y-4">
          <p>I currently work at Aboon, and I was most recently a designer at Instagram on the Growth Web team. Outside of work, I build the game journaling app GamePal, I create music as Cordio & Horizon Radar, restore and mod old game consoles, and take photos.</p>
          <p>I specialize in product design for both web and mobile apps and thrive in 0 → 1 work. My expertise is in design leadership, visual design, user experience, and design systems. I also have a background in Engineering, with a focus on React, CSS architecture, and component systems.</p>
          <p>I'm currently available for full time and contract design roles for early stage startups and sound/music design projects for games, apps, podcasts, and films.</p>
          <p>I produce music under the alias Cordio, and create tracks for films, shows, and podcasts. Listen to all my music anywhere you stream music, or snag some on my Bandcamp.</p>
        </div>
      </div>
    </main>
  );
}
