import { NextResponse } from "next/server";
import { resend } from "@/lib/resend";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { email, confirmedHuman } = (body as { email?: unknown; confirmedHuman?: unknown } | null) ?? {};
  if (typeof email !== "string" || !EMAIL_PATTERN.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address" }, { status: 400 });
  }

  if (confirmedHuman !== true) {
    return NextResponse.json({ error: "Please confirm you're not a robot" }, { status: 400 });
  }

  if (!process.env.RESEND_API_KEY || !process.env.RESEND_SEGMENT_ID) {
    console.error("RESEND_API_KEY or RESEND_SEGMENT_ID is not set in this environment.");
    return NextResponse.json(
      { error: "Newsletter sign-up is not configured on the server" },
      { status: 500 }
    );
  }

  try {
    const { error } = await resend.contacts.create({
      email,
      unsubscribed: false,
      segments: [{ id: process.env.RESEND_SEGMENT_ID }],
    });

    if (error && !/already exists/i.test(error.message)) {
      console.error("Failed to add newsletter contact:", error.message);
      return NextResponse.json({ error: "Something went wrong, try again" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Failed to add newsletter contact:", message);
    return NextResponse.json({ error: "Something went wrong, try again" }, { status: 500 });
  }
}
