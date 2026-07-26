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

export function BackLink({ href, iconSize = 18, className }: BackLinkProps) {
  return (
    <LinkPill href={href} className={className}>
      <ArrowLeft size={iconSize} /> Back
    </LinkPill>
  );
}
