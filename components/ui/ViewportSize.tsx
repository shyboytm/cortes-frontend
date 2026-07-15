"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export interface ViewportSizeProps {
  className?: string;
}

// Live window.innerWidth/innerHeight, updated on resize — null until the
// first effect runs so the server-rendered markup (which has no viewport
// to measure) and the first client render agree, avoiding a hydration
// mismatch.
export default function ViewportSize({ className }: ViewportSizeProps) {
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);

  useEffect(() => {
    const update = () => setSize({ width: window.innerWidth, height: window.innerHeight });
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  if (!size) return null;

  return (
    <p className={cn(className)}>
      USR VWPRT | {size.width} &times; {size.height}
    </p>
  );
}
