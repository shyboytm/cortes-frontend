import { Resend } from "resend";

// Server-only Resend client, used by /api/subscribe to add newsletter
// sign-ups as contacts in a Resend Audience. Reads a RESEND_API_KEY
// environment variable — without it, Resend's SDK throws on first use
// rather than at import time, so callers should still handle that failure.
export const resend = new Resend(process.env.RESEND_API_KEY);
