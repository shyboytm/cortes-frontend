import { NextResponse } from "next/server";
import { client } from "@/sanity/client";
import { WORK_UNLOCK_COOKIE_PREFIX } from "@/lib/work-unlock";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const slug = (body as { slug?: unknown } | null)?.slug;
  const password = (body as { password?: unknown } | null)?.password;

  if (typeof slug !== "string" || !slug || typeof password !== "string" || !password) {
    return NextResponse.json({ error: "Missing slug or password" }, { status: 400 });
  }

  const work = await client.fetch<{ comingSoon?: boolean; comingSoonPassword?: string } | null>(
    `*[_type == "work" && slug.current == $slug][0]{comingSoon, comingSoonPassword}`,
    { slug }
  );

  if (!work?.comingSoon || !work.comingSoonPassword || password !== work.comingSoonPassword) {
    return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(`${WORK_UNLOCK_COOKIE_PREFIX}${slug}`, password, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: `/work/${slug}`,
    maxAge: 60 * 60 * 24 * 30,
  });
  return response;
}
