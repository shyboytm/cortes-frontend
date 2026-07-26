"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export interface ViewportSizeProps {
  className?: string;
}

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
      VWPRT.EXE | {size.width} &times; {size.height}
    </p>
  );
}
