"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Next.js scrolls to the top of the page on <Link> navigation by default,
// but that only actually happens if the document is scrollable at the exact
// moment navigation fires. It's a no-op whenever something — the PrimaryNav
// menu, a lightbox, any future overlay — still has the body scroll-locked
// at that instant, and the old scroll position just carries over once the
// lock releases a beat later. Rather than keep chasing down every place
// that could race with it, this force-scrolls to the top on every route
// change as a hard guarantee, independent of whatever link or component
// triggered the navigation.
export default function ScrollRestoration() {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
