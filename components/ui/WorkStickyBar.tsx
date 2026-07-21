"use client";

import DetailStickyBar from "@/components/ui/DetailStickyBar";
import { useSmartBackHref } from "@/lib/hooks/useSmartBackHref";

export interface WorkStickyBarProps {
  id: string;
  title: string;
  likes?: number;
}

// Thin wrapper around DetailStickyBar for Work case studies: its Back link
// needs to resolve client-side (same "came from /work vs. the homepage"
// logic as WorkBackLink), which an async Server Component page can't do
// itself.
export default function WorkStickyBar({ id, title, likes }: WorkStickyBarProps) {
  const backHref = useSmartBackHref("/#work", "/work", "/work");
  return (
    <DetailStickyBar id={id} title={title} likes={likes} backHref={backHref} sentinelId="work-title-sentinel" />
  );
}
