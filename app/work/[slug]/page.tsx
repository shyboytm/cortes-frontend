import Image from "next/image";
import { notFound } from "next/navigation";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import { client, sanityFetchOptions } from "@/sanity/client";
import { urlFor } from "@/sanity/image";
import PrimaryNav from "@/components/ui/PrimaryNav";
import PageHeader from "@/components/ui/PageHeader";
import { BackLink } from "@/components/ui/LinkPill";
import { portableTextLinkMark, portableTextHeadings } from "@/lib/portable-text-marks";

const WORK_BY_SLUG_QUERY = `*[
  _type == "work"
  && slug.current == $slug
][0]{
  _id,
  title,
  dateRange,
  role,
  scope,
  industry,
  description,
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

const options = sanityFetchOptions(30);

// Renders the mixed text/image case-study body from Sanity. Each image
// carries a projected aspect ratio so it doesn't shift as it loads.
const caseStudyComponents: PortableTextComponents = {
  marks: {
    link: portableTextLinkMark,
  },
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
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 90vw, 1200px"
          />
        </div>
      );
    },
  },
  block: {
    normal: ({ children }) => (
      <p className="my-4 text-lg leading-relaxed text-black/80 dark:text-white/80">{children}</p>
    ),
    ...portableTextHeadings,
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

      <div className="m-auto w-full max-w-7xl px-6 md:px-10">
        <BackLink href="/#work" iconSize={16} />

        <PageHeader title={work.title} subtitle={work.description || work.dateRange} className="mt-6" />

        {(() => {
          const metaItems = [
            { label: "Role", value: work.role },
            { label: "Scope", value: work.scope },
            { label: "Industry", value: work.industry },
            { label: "When", value: work.dateRange },
          ].filter((item) => item.value);

          if (metaItems.length === 0) return null;

          return (
            <div className="mb-10 grid grid-cols-1 gap-px overflow-hidden rounded-md border border-black/10 bg-black/10 lg:grid-cols-2 dark:border-white/10 dark:bg-white/10">
              {metaItems.map((item) => (
                <div key={item.label} className="bg-white p-4 dark:bg-black">
                  <p className="dot-font font-doto text-xs tracking-widest text-black/60 uppercase dark:text-white/60">
                    {item.label}
                  </p>
                  <p className="mt-1 text-base text-black dark:text-white">{item.value}</p>
                </div>
              ))}
            </div>
          );
        })()}

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
