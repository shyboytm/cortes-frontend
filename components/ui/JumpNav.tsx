import StickySubNav from "@/components/ui/StickySubNav";

export interface JumpNavProps {
  // Pre-rendered pills (each already wrapped in its own <Link> or <a>).
  // Rendered twice — once inline, once mirrored into StickySubNav — so
  // callers only need to build the list once.
  items: React.ReactNode[];
  ariaLabel: string;
  // Id of the sentinel div JumpNav renders right after the inline nav.
  // StickySubNav watches this via IntersectionObserver to know when to
  // reveal the mirrored bar under PrimaryNav.
  sentinelId: string;
  className?: string;
}

const DEFAULT_NAV_CLASSNAME = "mb-12 flex flex-wrap gap-2 border-b border-black/10 pb-8 dark:border-white/10";

// Renders an in-page jump nav (a row of pill links) plus the sentinel and
// StickySubNav needed to mirror those same links into a bar pinned under
// PrimaryNav once the inline nav scrolls out of view. Used by Music,
// Writing, and Recs, which each build their own array of pills but
// otherwise want identical nav/sentinel/sticky-bar wiring.
export default function JumpNav({ items, ariaLabel, sentinelId, className }: JumpNavProps) {
  return (
    <>
      <nav aria-label={ariaLabel} className={className ?? DEFAULT_NAV_CLASSNAME}>
        {items}
      </nav>
      <div id={sentinelId} />
      <StickySubNav sentinelId={sentinelId} ariaLabel={ariaLabel}>
        {items}
      </StickySubNav>
    </>
  );
}
