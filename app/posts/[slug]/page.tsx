import {PortableText, type SanityDocument} from "next-sanity";
import {createImageUrlBuilder, type SanityImageSource} from "@sanity/image-url";
import {client} from "@/sanity/client";
import Link from "next/link";

const POST_QUERY = `*[_type == "post" && slug.current == $slug][0]`;

const {projectId, dataset} = client.config();
const urlFor = (source: SanityImageSource) =>
  projectId && dataset
    ? createImageUrlBuilder({projectId, dataset}).image(source)
    : null;

const options = {next: {revalidate: 30}};

export default async function PostPage({
  params,
}: {
  params: Promise<{slug: string}>;
}) {
  const post = await client.fetch<SanityDocument>(POST_QUERY, await params, options);
  const postImageUrl = post.image
    ? urlFor(post.image)?.width(550).height(310).url()
    : null;

  return (
    <main className="w-4xl m-auto">
      <Link href="/">Back to posts</Link>
      {postImageUrl && (
        <img
          src={postImageUrl}
          alt={post.title}
          width="550"
          height="310"
        />
      )}
      <h1>{post.title}</h1>
      <p>Published: {new Date(post.publishedAt).toLocaleDateString()}</p>
      {Array.isArray(post.body) && <PortableText value={post.body} />}
    </main>
  );
}
