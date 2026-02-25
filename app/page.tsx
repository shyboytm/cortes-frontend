import Link from "next/link";
import {type SanityDocument} from "next-sanity";
import {client} from "@/sanity/client";
import Button from "@/components/ui/Button";
import PrimaryNav from "@/components/ui/PrimaryNav";
import Image from 'next/image'
import { Mailbox } from 'lucide-react';

const POSTS_QUERY = `*[
  _type == "post"
  && defined(slug.current)
]|order(publishedAt desc)[0...12]{_id, title, slug, publishedAt}`;

const options = {next: {revalidate: 30}};

export default async function IndexPage() {
  const posts = await client.fetch<SanityDocument[]>(POSTS_QUERY, {}, options);

  return (
    <main className="gradient-background pt-32">
      <PrimaryNav></PrimaryNav>
      
      <div id="main-content" className="m-auto w-xl">

        <div className="flex glow text-xl flex-col items-start gap-2">
          <span className="font-mono opacity-50 text-xs w-full">36.1627° N, 86.7816° W</span>
          <span className="font-mono opacity-50 text-xs w-full">DESIGN / PHOTO / CODE / MUSIC</span>
          <h1 className="font-semibold w-full">Dennis Cortés</h1>
          <h2 className="font-normal w-full">Software Product Designer</h2>
        </div>

        <div className="my-6">
          <Link href="https://www.instagram.com/shyboytm/">
            <div className="bg-black/10 dark:bg-white/10 inline-block opacity-75 hover:opacity-100 p-4 rounded-full transition-opacity">
              <Mailbox size={24} />
            </div>
          </Link>
        </div>

        <div className="font-mono opacity-75 my-6 space-y-4 text-sm">
          <p>I currently work at Aboon, and I was most recently a designer at Instagram on the Growth Web team. Outside of work, I build the game journaling app GamePal, I create music as Cordio & Horizon Radar, restore and mod old game consoles, and take photos.</p>
          <p>I specialize in product design for both web and mobile apps and thrive in 0 → 1 work. My expertise is in design leadership, visual design, user experience, and design systems. I also have a background in Engineering, with a focus on React, CSS architecture, and component systems.</p>
          <p>I'm currently available for full time and contract design roles for early stage startups and sound/music design projects for games, apps, podcasts, and films.</p>
          <p>I produce music under the alias Cordio, and create tracks for films, shows, and podcasts. Listen to all my music anywhere you stream music, or snag some on my Bandcamp.</p>
        </div>

        <Button variant="primary">Testing</Button>
        <Button variant="secondary">Testing</Button>
        <Button variant="tertiary">Testing</Button>

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
    </main>
  );
}
