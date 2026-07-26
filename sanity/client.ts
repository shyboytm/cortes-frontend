import {createClient} from "next-sanity";

export const client = createClient({
  projectId: "m83idean",
  dataset: "production",
  apiVersion: "2024-01-01",
  useCdn: false,
});

export const sanityFetchOptions = (revalidateSeconds: number = 30) => ({
  next: {revalidate: revalidateSeconds},
});
