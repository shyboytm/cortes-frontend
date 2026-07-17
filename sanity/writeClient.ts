import { createClient } from "next-sanity";

// Server-only Sanity client with write access, used by /api/like to
// increment a document's `likes` count. Reads a SANITY_API_WRITE_TOKEN
// environment variable with Editor/Write permissions; without it, writes
// fail with an auth error.
export const writeClient = createClient({
  projectId: "m83idean",
  dataset: "production",
  apiVersion: "2024-01-01",
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
});
