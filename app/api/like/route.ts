import { NextResponse } from "next/server";
import { client } from "@/sanity/client";
import { writeClient } from "@/sanity/writeClient";

// Document types with a `likes` field. The increment target's `_type` is
// checked against this list before any write happens.
const LIKEABLE_TYPES = ["post", "feedItem", "recommendation", "musicRelease", "product", "photo", "work"];

// Increments (or, with `action: "unlike"`, decrements) a document's `likes`
// field by 1 and returns the new total. The id is only ever used as the
// target of that update.
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const id = (body as { id?: unknown } | null)?.id;
  if (typeof id !== "string" || !id) {
    return NextResponse.json({ error: "Missing document id" }, { status: 400 });
  }

  const action = (body as { action?: unknown } | null)?.action;
  const delta = action === "unlike" ? -1 : 1;

  // Returns a specific error response when SANITY_API_WRITE_TOKEN isn't set in the environment.
  if (!process.env.SANITY_API_WRITE_TOKEN) {
    console.error("SANITY_API_WRITE_TOKEN is not set in this environment.");
    return NextResponse.json(
      { error: "SANITY_API_WRITE_TOKEN is not configured on the server" },
      { status: 500 }
    );
  }

  const docType = await client.fetch<string | null>(`*[_id == $id][0]._type`, { id });
  if (!docType || !LIKEABLE_TYPES.includes(docType)) {
    return NextResponse.json({ error: "Document is not likeable" }, { status: 404 });
  }

  try {
    const result = await writeClient
      .patch(id)
      .setIfMissing({ likes: 0 })
      .inc({ likes: delta })
      .commit<{ likes?: number }>();

    return NextResponse.json({ likes: Math.max(0, result.likes ?? 0) });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Failed to update likes:", message);
    return NextResponse.json({ error: `Failed to save like: ${message}` }, { status: 500 });
  }
}
