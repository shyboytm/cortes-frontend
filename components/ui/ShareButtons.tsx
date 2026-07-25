"use client";

import { Facebook, Linkedin } from "lucide-react";
import { SiX } from "@icons-pack/react-simple-icons";
import { cn } from "@/lib/utils";

export interface ShareButtonsProps {
  url: string;
  title: string;
  className?: string;
}

// Each platform's own share-intent URL — no SDK/JS popup needed, just a
// plain link opened in a new tab, same as any other outbound link on the
// site. X and LinkedIn accept a title/text; Facebook's sharer only takes
// the URL (it reads title/description from the page's own OG tags once it
// fetches it, which is exactly what the rest of this feature sets up).
function shareTargets(url: string, title: string) {
  const encodedUrl = encodeURIComponent(url);
  return [
    {
      label: "Share on X",
      Icon: SiX,
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodeURIComponent(title)}`,
    },
    {
      label: "Share on LinkedIn",
      Icon: Linkedin,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
    {
      label: "Share on Facebook",
      Icon: Facebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
  ];
}

// Bare icon row, same treatment as the site's other social-icon lists
// (footer, nav overlay): no pill or label, just an icon whose color shifts
// on hover, with the standard tick/press Cuelume feedback.
export default function ShareButtons({ url, title, className }: ShareButtonsProps) {
  return (
    <div className={cn("flex items-center gap-4", className)}>
      {shareTargets(url, title).map(({ label, Icon, href }) => (
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
          <Icon size={18} className="svg-shadow" />
        </a>
      ))}
    </div>
  );
}
