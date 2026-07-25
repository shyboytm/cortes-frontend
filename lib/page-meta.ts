import { cache } from "react";
import type { Metadata } from "next";
import { client, sanityFetchOptions } from "@/sanity/client";
import { urlFor } from "@/sanity/image";
import { DEFAULT_OG_IMAGE, SITE_NAME, SITE_URL } from "@/lib/site-config";

// The site's static pages — every route besides a Blog post or Work case
// study, which get their link-preview metadata from the post/case study
// itself instead (see buildMetadata's callers in those two [slug] pages).
export type PageKey = "home" | "work" | "music" | "photos" | "writing" | "shop" | "recs" | "about";

interface PageMetaDoc {
  title?: string;
  description?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  image?: any;
}

const PAGE_META_QUERY = `*[_type == "pageMeta" && page == $page][0]{ title, description, image }`;

const options = sanityFetchOptions(900);

// Cached per request (React's cache(), not Sanity/Next's fetch cache) so a
// page's generateMetadata() and its own render — if it ever needs the same
// doc — don't fire this query twice for one visit.
const getPageMetaDoc = cache(async (page: PageKey): Promise<PageMetaDoc | null> => {
  return client.fetch(PAGE_META_QUERY, { page }, options);
});

// Shared by every generateMetadata in the app (this file's resolvePageMetadata
// below, and the Writing/Work [slug] pages building their own from real post
// content) so every route ends up with the same shape of title/description/
// canonical/openGraph/twitter tags.
export function buildMetadata({
  title,
  description,
  imageUrl,
  path,
  type = "website",
}: {
  title: string;
  description: string;
  imageUrl: string;
  path: string;
  type?: "website" | "article";
}): Metadata {
  const url = `${SITE_URL}${path}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type,
      images: [{ url: imageUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

// Builds a static page's metadata from its Sanity "Page Metadata" doc (if
// one exists for `page`), falling back to `defaults` for any field left
// blank — so every page has a real title/description/preview image
// immediately, and creating a Sanity override is optional, not required.
export async function resolvePageMetadata(
  page: PageKey,
  defaults: { title: string; description: string },
  path: string
): Promise<Metadata> {
  const doc = await getPageMetaDoc(page);
  const title = doc?.title || defaults.title;
  const description = doc?.description || defaults.description;
  const imageUrl = doc?.image ? urlFor(doc.image).width(1200).height(630).fit("crop").url() : DEFAULT_OG_IMAGE;

  return buildMetadata({ title, description, imageUrl, path });
}
