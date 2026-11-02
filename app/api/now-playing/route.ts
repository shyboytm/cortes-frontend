import { NextResponse } from "next/server";
import { getNowPlaying } from "@/lib/lastfm";

export async function GET() {
  const track = await getNowPlaying();

  return NextResponse.json(
    { track },
    {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    }
  );
}
