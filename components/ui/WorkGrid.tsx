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

const DEFAULT_GRID_CLASSNAME = "grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3";

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
