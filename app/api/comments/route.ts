import { NextResponse } from "next/server";
import { client } from "@/sanity/client";
import { writeClient } from "@/sanity/writeClient";

const COMMENTABLE_TYPES = ["post", "work"];
const NAME_MAX_LENGTH = 80;
const MESSAGE_MAX_LENGTH = 2000;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { parentId, name, message, confirmedHuman } =
    (body as
      | { parentId?: unknown; name?: unknown; message?: unknown; confirmedHuman?: unknown }
      | null) ?? {};

  if (typeof parentId !== "string" || !parentId) {
    return NextResponse.json({ error: "Missing document id" }, { status: 400 });
  }

  if (typeof name !== "string" || !name.trim() || name.length > NAME_MAX_LENGTH) {
    return NextResponse.json({ error: "Enter your name" }, { status: 400 });
  }

  if (typeof message !== "string" || !message.trim() || message.length > MESSAGE_MAX_LENGTH) {
    return NextResponse.json({ error: "Enter a comment" }, { status: 400 });
  }

  if (confirmedHuman !== true) {
    return NextResponse.json({ error: "Please confirm you're not a robot" }, { status: 400 });
  }

  if (!process.env.SANITY_API_WRITE_TOKEN) {
    console.error("SANITY_API_WRITE_TOKEN is not set in this environment.");
    return NextResponse.json(
      { error: "Comments are not configured on the server" },
      { status: 500 }
    );
  }

  const docType = await client.fetch<string | null>(`*[_id == $id][0]._type`, { id: parentId });
  if (!docType || !COMMENTABLE_TYPES.includes(docType)) {
    return NextResponse.json({ error: "Comments aren't enabled on this document" }, { status: 404 });
  }

  try {
    await writeClient.create({
      _type: "comment",
      name: name.trim(),
      message: message.trim(),
      parent: { _type: "reference", _ref: parentId },
      approved: false,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Failed to save comment:", message);
    return NextResponse.json({ error: "Something went wrong, try again" }, { status: 500 });
  }
}
