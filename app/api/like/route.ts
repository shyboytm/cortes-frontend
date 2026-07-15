import { NextResponse } from "next/server";
import { writeClient } from "@/sanity/writeClient";

// The single mutation this route performs: bump a post/feedItem's `likes`
// field by 1 and hand back the new total. Nothing else is patchable through
// here — the id is only ever used as the target of an increment.
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

  // Fail loudly and specifically rather than letting Sanity's client throw
  // a generic auth error further down — this is the #1 reason writes fail
  // (the token has to be set in *this* environment's env vars, and on most
  // hosts that means redeploying after adding it, not just saving it).
  if (!process.env.SANITY_API_WRITE_TOKEN) {
    console.error("SANITY_API_WRITE_TOKEN is not set in this environment.");
    return NextResponse.json(
      { error: "SANITY_API_WRITE_TOKEN is not configured on the server" },
      { status: 500 }
    );
  }

  try {
    const result = await writeClient
      .patch(id)
      .setIfMissing({ likes: 0 })
      .inc({ likes: 1 })
      .commit<{ likes?: number }>();

    return NextResponse.json({ likes: result.likes ?? 0 });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Failed to increment likes:", message);
    return NextResponse.json({ error: `Failed to save like: ${message}` }, { status: 500 });
  }
}
