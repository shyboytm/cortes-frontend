import StickySubNav from "@/components/ui/StickySubNav";

export interface JumpNavProps {
  items: React.ReactNode[];
  ariaLabel: string;
  sentinelId: string;
  className?: string;
}

const DEFAULT_NAV_CLASSNAME = "mb-12 flex flex-wrap gap-2 border-b border-black/10 pb-8 dark:border-white/10";

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
