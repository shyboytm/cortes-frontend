"use client";

import { BackLink } from "@/components/ui/LinkPill";
import { useSmartBackHref } from "@/lib/hooks/useSmartBackHref";

export default function WorkBackLink({ iconSize }: { iconSize?: number }) {
  const href = useSmartBackHref("/#work", "/work", "/work");
  return <BackLink href={href} iconSize={iconSize} />;
}
