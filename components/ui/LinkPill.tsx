import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface LinkPillProps {
  href: string;
  external?: boolean;
  className?: string;
  children: React.ReactNode;
}

// Generic pill-shaped link styled like a secondary button — used for "Back"
// links, footer links, and anywhere else a small rounded-pill nav link is
// needed. `external` conditionally opens the link in a new tab.
export function LinkPill({ href, external, className, children }: LinkPillProps) {
  return (
    <Link
      href={href}
      className={cn(buttonVariants({ variant: "secondary", size: "sm" }), className)}
      data-cuelume-hover="tick"
      data-cuelume-press
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {children}
    </Link>
  );
}

export interface BackLinkProps {
  href: string;
  iconSize?: number;
  className?: string;
}

// Convenience wrapper around LinkPill for the recurring "<- Back" pattern
// used at the top of detail/list pages.
export function BackLink({ href, iconSize = 18, className }: BackLinkProps) {
  return (
    <LinkPill href={href} className={className}>
      <ArrowLeft size={iconSize} /> Back
    </LinkPill>
  );
}
