import { cache } from "react";
import type { Metadata } from "next";
import type { SanityImageSource } from "@sanity/image-url";
import { client, sanityFetchOptions } from "@/sanity/client";
import { urlFor } from "@/sanity/image";
import { DEFAULT_OG_IMAGE, SITE_NAME, SITE_URL } from "@/lib/site-config";

export type PageKey = "home" | "work" | "music" | "photos" | "writing" | "shop" | "recs" | "about";

interface PageMetaDoc {
  title?: string;
  description?: string;
  image?: SanityImageSource;
}

const PAGE_META_QUERY = `*[_type == "pageMeta" && page == $page][0]{ title, description, image }`;

const options = sanityFetchOptions(900);

const getPageMetaDoc = cache(async (page: PageKey): Promise<PageMetaDoc | null> => {
  return client.fetch(PAGE_META_QUERY, { page }, options);
});

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
  const diacriticPattern = new RegExp("[\\u0300-\\u036f]", "g");
  const normalize = (value: string) => value.normalize("NFD").replace(diacriticPattern, "").toLowerCase();
  const alreadyPrefixed = normalize(title).startsWith(normalize(`${SITE_NAME} - `));
  const prefixedTitle = alreadyPrefixed ? title : `${SITE_NAME} - ${title}`;
  return {
    title: prefixedTitle,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: prefixedTitle,
      description,
      url,
      siteName: SITE_NAME,
      type,
      images: [{ url: imageUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: prefixedTitle,
      description,
      images: [imageUrl],
    },
  };
}

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
