"use client";

import { useState } from "react";
import { Globe } from "lucide-react";
import { cn } from "@/lib/utils";

export interface RecLinkPreviewImageProps {
  url: string;
}

// The image half of RecRow's hover preview card — split into its own client
// component just so it can track image-load state locally. Shows a plain,
// site-styled loading placeholder (same "media not ready" look used
// elsewhere, e.g. MusicReleaseCard's disc fallback) while the screenshot
// request is in flight, then crossfades to the actual image once it
// arrives — so instead of a flash of a bare/broken-looking image (or
// mshots' own "generating preview" graphic showing through unstyled), the
// very first thing visible is something that matches the rest of the site.
export default function RecLinkPreviewImage({ url }: RecLinkPreviewImageProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="relative h-full w-full">
      <div
        className={cn(
          "absolute inset-0 flex items-center justify-center bg-black/5 transition-opacity duration-300 dark:bg-white/5",
          loaded ? "pointer-events-none opacity-0" : "animate-preview-pulse opacity-100"
        )}
      >
        <Globe size={20} className="text-black/20 dark:text-white/20" />
      </div>

      {/* eslint-disable-next-line @next/next/no-img-element -- this is an
          on-the-fly screenshot from a third-party service (mshots);
          next/image can't optimize an arbitrary external URL like this,
          and the domain has no business being in next.config's
          remotePatterns. */}
      <img
        src={`https://s0.wp.com/mshots/v1/${encodeURIComponent(url)}?w=960&h=600`}
        alt=""
        loading="lazy"
        onLoad={() => setLoaded(true)}
        className={cn(
          "h-full w-full object-cover object-top transition-opacity duration-300",
          loaded ? "opacity-100" : "opacity-0"
        )}
      />
    </div>
  );
}
