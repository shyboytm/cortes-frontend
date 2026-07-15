import { cn } from "@/lib/utils";

export interface PageHeaderProps {
  title: string;
  subtitle?: React.ReactNode;
  className?: string;
}

// The "name of the page + subtitle" block used at the top of every page
// except the homepage (which has its own bespoke intro). Shared so the
// Work/Feed/About indexes and the Work/Post detail pages all render the
// exact same title treatment instead of each hand-rolling their own markup.
export default function PageHeader({ title, subtitle, className }: PageHeaderProps) {
  return (
    <div className={cn("mb-5 flex flex-col lg:mb-10 lg:flex-row items-start lg:justify-between gap-2 lg:gap-8", className)}>
      <h1 className="text-3xl font-light leading-[1.25] max-w-3xl text-black sm:text-4xl lg:text-5xl dark:text-white mb-3 lg:mb-6">{title}</h1>
      {subtitle && (
        <h2 className="text-xl text-black/60 dark:text-white/80 max-w-3xl mb-3 lg:mb-6 font-light sm:text-2xl lg:text-4xl leading-[1.25]">
          {subtitle}
        </h2>
      )}
    </div>
  );
}
