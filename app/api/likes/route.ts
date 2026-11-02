import { NextResponse } from "next/server";
import { client } from "@/sanity/client";

const MAX_IDS = 100;

export async function GET(request: Request) {
  const idsParam = new URL(request.url).searchParams.get("ids") ?? "";
  const ids = idsParam
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean)
    .slice(0, MAX_IDS);

  if (ids.length === 0) {
    return NextResponse.json({ likes: {} });
  }

  const docs = await client.fetch<{ _id: string; likes?: number }[]>(
    `*[_id in $ids]{_id, likes}`,
    { ids },
    { cache: "no-store" }
  );

  const likes: Record<string, number> = {};
  ids.forEach((id) => {
    likes[id] = 0;
  });
  docs.forEach((doc) => {
    likes[doc._id] = Math.max(0, doc.likes ?? 0);
  });

  return NextResponse.json(
    { likes },
    {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=600",
      },
    }
  );
}
