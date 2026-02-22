import Link from "next/link";
import {type SanityDocument} from "next-sanity";
import {client} from "@/sanity/client";
import Button from "@/components/ui/Button";

const POSTS_QUERY = `*[
  _type == "post"
  && defined(slug.current)
]|order(publishedAt desc)[0...12]{_id, title, slug, publishedAt}`;

const options = {next: {revalidate: 30}};

export default async function IndexPage() {
  const posts = await client.fetch<SanityDocument[]>(POSTS_QUERY, {}, options);

  return (
    <main className="m-auto mt-16">
      <div className="flex text-xl flex-col items-start gap-2">
        <h1 className="">Dennis Cortés</h1>
        <h2 className="font-normal">Software Product Designer</h2>
      </div>
      <Button variant="secondary">Testing</Button>
      <ul>
        {posts.map((post) => (
          <li key={post._id}>
            <Link href={`/posts/${post.slug.current}`}>
              <h2>{post.title}</h2>
              <p>{new Date(post.publishedAt).toLocaleDateString()}</p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
