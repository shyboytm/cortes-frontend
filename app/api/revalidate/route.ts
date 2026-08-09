import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

const PAGE_META_PATHS: Record<string, string> = {
  home: "/",
  work: "/work",
  music: "/music",
  photos: "/photos",
  writing: "/writing",
  shop: "/shop",
  recs: "/recs",
  about: "/about",
};

type SanityWebhookPayload = {
  _type?: string;
  slug?: { current?: string } | string | null;
  page?: string;
};

function resolveSlug(payload: SanityWebhookPayload): string | undefined {
  if (typeof payload.slug === "string") return payload.slug;
  return payload.slug?.current;
}

function pathsForDocument(payload: SanityWebhookPayload): string[] {
  const slug = resolveSlug(payload);

  switch (payload._type) {
    case "work":
      return slug ? ["/", "/work", `/work/${slug}`] : ["/", "/work"];
    case "feedItem":
      return ["/work"];
    case "post":
      return slug ? ["/writing", `/writing/${slug}`] : ["/writing"];
    case "recommendation":
      return ["/recs"];
    case "musicRelease":
      return ["/music", "/music/releases"];
    case "product":
      return ["/shop"];
    case "photo":
      return ["/photos"];
    case "testimonial":
    case "service":
    case "client":
    case "pressMention":
    case "experience":
      return ["/about"];
    case "pageMeta":
      return payload.page && PAGE_META_PATHS[payload.page] ? [PAGE_META_PATHS[payload.page]] : [];
    default:
      return [];
  }
}

export async function POST(request: Request) {
  const secret = request.headers.get("x-webhook-secret");
  if (!process.env.SANITY_REVALIDATE_SECRET || secret !== process.env.SANITY_REVALIDATE_SECRET) {
    return NextResponse.json({ error: "Invalid secret" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const paths = pathsForDocument((body as SanityWebhookPayload) ?? {});
  paths.forEach((path) => revalidatePath(path));

  return NextResponse.json({ revalidated: paths });
}
