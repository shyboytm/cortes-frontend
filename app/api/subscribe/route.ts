import { NextResponse } from "next/server";
import { resend } from "@/lib/resend";

// Deliberately simple — just enough to catch typos/empty input, not a full
// RFC 5322 validator. Resend itself is the real source of truth on whether
// an address is deliverable.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Adds an email as a contact to a single Resend Audience (the site's
// newsletter list). Actual broadcast emails are composed and sent from the
// Resend dashboard by hand, so this route's only job is capturing sign-ups.
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const email = (body as { email?: unknown } | null)?.email;
  if (typeof email !== "string" || !EMAIL_PATTERN.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address" }, { status: 400 });
  }

  if (!process.env.RESEND_API_KEY || !process.env.RESEND_SEGMENT_ID) {
    console.error("RESEND_API_KEY or RESEND_SEGMENT_ID is not set in this environment.");
    return NextResponse.json(
      { error: "Newsletter sign-up is not configured on the server" },
      { status: 500 }
    );
  }

  try {
    // `segments` is the current API — Resend renamed Audiences to Segments
    // and deprecated the old `audienceId` field (still works, but is marked
    // deprecated in the SDK's types as of the version this project pins).
    const { error } = await resend.contacts.create({
      email,
      unsubscribed: false,
      segments: [{ id: process.env.RESEND_SEGMENT_ID }],
    });

    // Resend's SDK returns an `error` object on the result rather than
    // throwing for most failure modes — re-subscribing an already-present,
    // non-unsubscribed contact is one of them, and isn't a real error from
    // the visitor's point of view.
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
