import WorkRow, { type WorkRowImage } from "@/components/ui/WorkRow";

export interface WorkGridItem {
  _id: string;
  title: string;
  dateRange?: string;
  mainImage?: WorkRowImage | null;
  hoverImage?: WorkRowImage | null;
  slug?: { current?: string } | null;
  hasCaseStudy?: boolean;
  comingSoon?: boolean;
  likes?: number;
}

export interface WorkGridProps {
  workItems: WorkGridItem[];
  className?: string;
}

// Both callers (homepage and /work) lay these cards out in an identical
// column grid — this is just the default, overridable via `className` if a
// future caller needs a different column count/gap.
const DEFAULT_GRID_CLASSNAME = "grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3";

// Shared rendering of a WORK_QUERY result into a grid of WorkRow cards. Only
// the first card is marked `priority` since it's the largest-priority LCP
// candidate on both pages that render this grid.
export default function WorkGrid({ workItems, className }: WorkGridProps) {
  return (
    <div className={className ?? DEFAULT_GRID_CLASSNAME}>
      {workItems.map((work, index) => (
        <WorkRow
          key={work._id}
          id={work._id}
          title={work.title}
          dateRange={work.dateRange}
          mainImage={work.mainImage}
          hoverImage={work.hoverImage}
          slug={work.slug?.current}
          hasCaseStudy={work.hasCaseStudy}
          comingSoon={work.comingSoon}
          likes={work.likes}
          priority={index === 0}
        />
      ))}
    </div>
  );
}
