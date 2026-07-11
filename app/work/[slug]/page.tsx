import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import { client } from "@/sanity/client";
import { urlFor } from "@/sanity/image";
import PrimaryNav from "@/components/ui/PrimaryNav";

const WORK_BY_SLUG_QUERY = `*[
  _type == "work"
  && slug.current == $slug
][0]{
  _id,
  title,
  dateRange,
  photos[]{
    _key,
    alt,
    asset,
    "aspectRatio": asset->metadata.dimensions.aspectRatio
  },
  caseStudy[]{
    ...,
    _type == "image" => {
      "aspectRatio": asset->metadata.dimensions.aspectRatio
    }
  }
}`;

const options = { next: { revalidate: 30 } };

// Renders the mixed text/image case-study body written in Sanity. Images
// carry the same aspect-ratio projection trick WorkRow uses so they don't
// jump around as they load.
const caseStudyComponents: PortableTextComponents = {
  types: {
    image: ({ value }) => {
      if (!value?.asset) return null;
      const ratio = value.aspectRatio && value.aspectRatio > 0 ? value.aspectRatio : 16 / 9;

      return (
        <div
          className="relative my-8 w-full overflow-hidden rounded-sm border border-black/10 bg-black/5 dark:border-white/10 dark:bg-white/5"
          style={{ aspectRatio: ratio }}
        >
          <Image
            src={urlFor(value.asset).width(1600).fit("max").url()}
            alt={value.alt || ""}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 800px"
          />
        </div>
      );
    },
  },
  block: {
    normal: ({ children }) => (
      <p className="my-4 text-lg leading-relaxed text-black/80 dark:text-white/80">{children}</p>
    ),
    h2: ({ children }) => (
      <h2 className="mt-10 mb-4 text-2xl font-normal text-black dark:text-white">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="mt-8 mb-3 text-xl font-normal text-black dark:text-white">{children}</h3>
    ),
  },
};

export default async function WorkCaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const work = await client.fetch(WORK_BY_SLUG_QUERY, { slug }, options);

  if (!work) {
    notFound();
  }

  return (
    <div className="pt-32 pb-24">
      <PrimaryNav />

      <div className="m-auto w-full max-w-3xl px-6 md:px-10">
        <Link
          href="/#work"
          className="text-sm tracking-widest text-black/50 uppercase transition-colors hover:text-black dark:text-white/50 dark:hover:text-white"
        >
          ← Back
        </Link>

        <div className="mt-6 mb-10 flex flex-col gap-1">
          <h1 className="text-4xl font-normal text-black md:text-5xl dark:text-white">
            {work.title}
          </h1>
          {work.dateRange && (
            <p className="dot-font font-doto text-sm tracking-widest text-black/40 uppercase dark:text-white/80">
              {work.dateRange}
            </p>
          )}
        </div>

        {work.caseStudy && work.caseStudy.length > 0 ? (
          <PortableText value={work.caseStudy} components={caseStudyComponents} />
        ) : (
          <p className="text-black/60 dark:text-white/60">
            No case study has been written for this project yet.
          </p>
        )}
      </div>
    </div>
  );
}
