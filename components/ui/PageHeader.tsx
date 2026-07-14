import { cn } from "@/lib/utils";

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
}

// The "name of the page + subtitle" block used at the top of every page
// except the homepage (which has its own bespoke intro). Shared so the
// Work/Feed/About indexes and the Work/Post detail pages all render the
// exact same title treatment instead of each hand-rolling their own markup.
export default function PageHeader({ title, subtitle, className }: PageHeaderProps) {
  return (
    <div className={cn("mb-10 flex flex-col lg:flex-row items-start lg:justify-between gap-2 lg:gap-8", className)}>
      <h1 className="text-5xl font-light leading-[1.25] max-w-3xl text-black md:text-5xl dark:text-white mb-6">{title}</h1>
      {subtitle && (
        <h2 className="text-4xl text-black/40 dark:text-white/80 max-w-3xl mb-6 font-light md:text-4xl leading-[1.25]">
          {subtitle}
        </h2>
      )}
    </div>
  );
}
