import { createClient } from "next-sanity";

// Server-only — never import this from a Client Component or anything that
// ends up in the browser bundle. Used solely by /api/like to increment a
// document's `likes` count.
//
// Requires a SANITY_API_WRITE_TOKEN environment variable: a token with
// Editor (or Write) permissions, created at manage.sanity.io -> your
// project -> API -> Tokens, added to .env.local (and to your hosting
// provider's env vars for production). Deliberately not prefixed with
// NEXT_PUBLIC_ so it's never bundled client-side. Without it, writes here
// will fail with an auth error.
export const writeClient = createClient({
  projectId: "m83idean",
  dataset: "production",
  apiVersion: "2024-01-01",
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
});
