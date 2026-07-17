import { NextResponse } from "next/server";
import { writeClient } from "@/sanity/writeClient";

// Increments a post or feedItem's `likes` field by 1 and returns the new total.
// The id is only ever used as the target of that increment.
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

  // Returns a specific error response when SANITY_API_WRITE_TOKEN isn't set in the environment.
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
