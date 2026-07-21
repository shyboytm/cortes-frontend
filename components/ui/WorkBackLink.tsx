"use client";

import { BackLink } from "@/components/ui/LinkPill";
import { useSmartBackHref } from "@/lib/hooks/useSmartBackHref";

// Work case study pages are linked from both the homepage's Featured
// Projects section and the /work index — "Back" should return you to
// whichever one you actually came from, falling back to the homepage's Work
// section for direct links/new tabs.
export default function WorkBackLink({ iconSize }: { iconSize?: number }) {
  const href = useSmartBackHref("/#work", "/work", "/work");
  return <BackLink href={href} iconSize={iconSize} />;
}
