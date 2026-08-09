import { client, sanityFetchOptions } from "@/sanity/client";

export interface CommentDoc {
  _id: string;
  name: string;
  message: string;
  createdAt: string;
}

const COMMENTS_QUERY = `*[
  _type == "comment"
  && approved == true
  && parent._ref == $parentId
] | order(createdAt asc){
  _id,
  name,
  message,
  createdAt
}`;

export async function getComments(parentId: string): Promise<CommentDoc[]> {
  return client.fetch(COMMENTS_QUERY, { parentId }, sanityFetchOptions());
}
