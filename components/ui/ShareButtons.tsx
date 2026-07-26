"use client";

import { Facebook, Linkedin } from "lucide-react";
import { SiX } from "@icons-pack/react-simple-icons";
import { cn } from "@/lib/utils";

export interface ShareButtonsProps {
  url: string;
  title: string;
  className?: string;
}

function shareTargets(url: string, title: string) {
  const encodedUrl = encodeURIComponent(url);
  return [
    {
      label: "Share on X",
      Icon: SiX,
      size: 15,
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodeURIComponent(title)}`,
    },
    {
      label: "Share on LinkedIn",
      Icon: Linkedin,
      size: 18,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
    {
      label: "Share on Facebook",
      Icon: Facebook,
      size: 18,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
  ];
}

export default function ShareButtons({ url, title, className }: ShareButtonsProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <span className="dot-font font-doto text-xs tracking-widest text-black/60 uppercase dark:text-white/60">
        Share
      </span>
      <div className="flex items-center gap-4">
        {shareTargets(url, title).map(({ label, Icon, size, href }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            data-cuelume-hover="tick"
            data-cuelume-press
            className="text-black/60 transition-colors hover:text-black dark:text-white/60 dark:hover:text-white"
          >
            <Icon size={size} className="svg-shadow" />
          </a>
        ))}
      </div>
    </div>
  );
}
