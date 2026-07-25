export type VideoEmbedProvider = "youtube" | "vimeo";

export interface VideoEmbedInfo {
  provider: VideoEmbedProvider;
  embedUrl: string;
}

// Parses a YouTube or Vimeo URL — any of their common watch/share/short-link
// forms — into an iframe-embeddable URL. Returns null for anything else
// (including a malformed URL) so callers can fall back to a plain link
// instead of pointing an iframe at a non-embeddable page.
export function resolveVideoEmbed(rawUrl: string | undefined | null): VideoEmbedInfo | null {
  if (!rawUrl) return null;

  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return null;
  }

  const host = url.hostname.toLowerCase().replace(/^www\./, "");

  if (host === "youtu.be") {
    const id = url.pathname.slice(1).split("/")[0];
    if (id) return { provider: "youtube", embedUrl: `https://www.youtube.com/embed/${id}` };
  }

  if (host === "youtube.com" || host === "m.youtube.com" || host === "youtube-nocookie.com") {
    if (url.pathname === "/watch") {
      const id = url.searchParams.get("v");
      if (id) return { provider: "youtube", embedUrl: `https://www.youtube.com/embed/${id}` };
    }
    const shortsMatch = url.pathname.match(/^\/shorts\/([^/]+)/);
    if (shortsMatch) return { provider: "youtube", embedUrl: `https://www.youtube.com/embed/${shortsMatch[1]}` };
    const embedMatch = url.pathname.match(/^\/embed\/([^/]+)/);
    if (embedMatch) return { provider: "youtube", embedUrl: `https://www.youtube.com/embed/${embedMatch[1]}` };
  }

  if (host === "vimeo.com") {
    const match = url.pathname.match(/^\/(\d+)/);
    if (match) return { provider: "vimeo", embedUrl: `https://player.vimeo.com/video/${match[1]}` };
  }

  if (host === "player.vimeo.com") {
    const match = url.pathname.match(/^\/video\/(\d+)/);
    if (match) return { provider: "vimeo", embedUrl: `https://player.vimeo.com/video/${match[1]}` };
  }

  return null;
}
