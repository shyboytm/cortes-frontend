"use client";

import DetailStickyBar from "@/components/ui/DetailStickyBar";
import { useSmartBackHref } from "@/lib/hooks/useSmartBackHref";

export interface WorkStickyBarProps {
  id: string;
  title: string;
  likes?: number;
}

export default function WorkStickyBar({ id, title, likes }: WorkStickyBarProps) {
  const backHref = useSmartBackHref("/#work", "/work", "/work");
  return (
    <DetailStickyBar id={id} title={title} likes={likes} backHref={backHref} sentinelId="work-title-sentinel" />
  );
}
