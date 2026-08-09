import { cache } from "react";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import { client, sanityFetchOptions } from "@/sanity/client";
import { urlFor } from "@/sanity/image";
import PrimaryNav from "@/components/ui/PrimaryNav";
import PageHeader from "@/components/ui/PageHeader";
import WorkBackLink from "@/components/ui/WorkBackLink";
import WorkStickyBar from "@/components/ui/WorkStickyBar";
import WorkPasswordGate from "@/components/ui/WorkPasswordGate";
import LikeButton from "@/components/ui/LikeButton";
import CommentSection from "@/components/ui/CommentSection";
import { getComments } from "@/lib/comments";
import { WORK_UNLOCK_COOKIE_PREFIX } from "@/lib/work-unlock";
import { portableTextLinkMark, portableTextHeadings } from "@/lib/portable-text-marks";
import { prepareImageBlocks, createPortableTextComponents, textSpacingClassName } from "@/lib/portable-text-images";
import { portableTextToPlainText } from "@/lib/portable-text-to-plain";
import { buildMetadata } from "@/lib/page-meta";
import { DEFAULT_OG_IMAGE } from "@/lib/site-config";

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
  comingSoon,
  comingSoonPassword,
  likes,
  mainImage,
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
    },
    _type == "video" => {
      "url": asset->url,
      "mimeType": asset->mimeType
    }
  }
}`;

const options = sanityFetchOptions();

const getWork = cache(async (slug: string) => {
  return client.fetch(WORK_BY_SLUG_QUERY, { slug }, options);
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const work = await getWork(slug);
  if (!work || work.comingSoon) return {};

  const description =
    portableTextToPlainText(work.caseStudy, 160) ||
    work.description ||
    "Some of my featured work from over the years including full-time jobs, personal projects, and freelance contracts.";
  const imageUrl = work.mainImage
    ? urlFor(work.mainImage).width(1200).height(630).fit("crop").url()
    : DEFAULT_OG_IMAGE;

  return buildMetadata({
    title: `${work.title} Project`,
    description,
    imageUrl,
    path: `/work/${slug}`,
    type: "article",
  });
}

function createCaseStudyComponents(): PortableTextComponents {
  return createPortableTextComponents({
    marks: {
      link: portableTextLinkMark,
    },
    block: {
      normal: ({ children, value }) => (
        <p
          className={`mx-auto max-w-3xl text-lg leading-relaxed text-black/80 dark:text-white/80 ${textSpacingClassName(value, "mt-4", "mb-4")}`}
        >
          {children}
        </p>
      ),
      ...portableTextHeadings,
    },
  });
}

export default async function WorkCaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const work = await getWork(slug);

  if (!work) {
    notFound();
  }

  if (work.comingSoon) {
    if (!work.comingSoonPassword) {
      notFound();
    }

    const cookieStore = await cookies();
    const unlocked = cookieStore.get(`${WORK_UNLOCK_COOKIE_PREFIX}${slug}`)?.value === work.comingSoonPassword;

    if (!unlocked) {
      return <WorkPasswordGate slug={slug} title={work.title} />;
    }
  }

  const caseStudy = Array.isArray(work.caseStudy) ? await prepareImageBlocks(work.caseStudy) : [];
  const comments = await getComments(work._id);

  return (
    <div className="pt-32 pb-24">
      <PrimaryNav />
      <WorkStickyBar id={work._id} title={work.title} likes={work.likes ?? 0} />

      <div className="m-auto w-full max-w-7xl px-6 md:px-10">
        <div className="flex items-center justify-between gap-4">
          <WorkBackLink iconSize={16} />

          <LikeButton id={work._id} initialLikes={work.likes ?? 0} />
        </div>

        <PageHeader title={work.title} subtitle={work.description || work.dateRange} className="mt-6" />
        <div id="work-title-sentinel" />

        {(() => {
          const metaItems = [
            { label: "Role", value: work.role },
            { label: "Scope", value: work.scope },
            { label: "Industry", value: work.industry },
            { label: "When", value: work.dateRange },
          ].filter((item) => item.value);

          if (metaItems.length === 0) return null;

          return (
            <div className="mb-24 grid grid-cols-1 gap-px overflow-hidden rounded-md border border-black/5 bg-black/[0.03] lg:grid-cols-2 dark:border-white/5 dark:bg-white/[0.03]">
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

        {caseStudy.length > 0 ? (
          <PortableText value={caseStudy} components={createCaseStudyComponents()} />
        ) : (
          <p className="text-black/60 dark:text-white/60">
            No case study has been written for this project yet.
          </p>
        )}

        <CommentSection parentId={work._id} initialComments={comments} className="mt-20" />
      </div>
    </div>
  );
}
