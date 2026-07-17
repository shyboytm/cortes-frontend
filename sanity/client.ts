import {createClient} from "next-sanity";

export const client = createClient({
  projectId: "m83idean",
  dataset: "production",
  apiVersion: "2024-01-01",
  useCdn: false,
});

// Shared `next: { revalidate }` fetch options so every page that reads from
// Sanity opts into the same ISR behavior instead of redeclaring this object.
export const sanityFetchOptions = (revalidateSeconds: number = 30) => ({
  next: {revalidate: revalidateSeconds},
});
