export type NowPlayingTrack = {
  title: string;
  artist: string;
  album?: string;
  imageUrl?: string;
  url?: string;
  isNowPlaying: boolean;
};

const LASTFM_ENDPOINT = "https://ws.audioscrobbler.com/2.0/";

const LASTFM_BLANK_ART_HASH = "2a96cbd8b46e442fc41c2b86b821562f";

type LastfmImage = { size: string; "#text": string };

export async function getNowPlaying(): Promise<NowPlayingTrack | null> {
  const apiKey = process.env.LASTFM_API_KEY;
  const username = process.env.LASTFM_USERNAME;

  if (!apiKey || !username) {
    return null;
  }

  const url = new URL(LASTFM_ENDPOINT);
  url.searchParams.set("method", "user.getrecenttracks");
  url.searchParams.set("user", username);
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "1");

  try {
    const res = await fetch(url.toString(), {
      next: { revalidate: 300 },
    });

    if (!res.ok) return null;

    const data = await res.json();
    const track = data?.recenttracks?.track?.[0];
    if (!track) return null;

    const images: LastfmImage[] = Array.isArray(track.image) ? track.image : [];
    const rawImageUrl =
      images.find((img) => img.size === "extralarge")?.["#text"] || images.at(-1)?.["#text"] || "";
    const imageUrl = rawImageUrl && !rawImageUrl.includes(LASTFM_BLANK_ART_HASH) ? rawImageUrl : undefined;

    return {
      title: track.name,
      artist: track.artist?.["#text"] ?? track.artist?.name ?? "",
      album: track.album?.["#text"] || undefined,
      imageUrl,
      url: track.url,
      isNowPlaying: track["@attr"]?.nowplaying === "true",
    };
  } catch {
    return null;
  }
}
