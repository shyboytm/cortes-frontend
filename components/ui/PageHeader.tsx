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
    <div className={cn("mb-10 flex flex-col items-start gap-2", className)}>
      <h1 className="text-4xl font-normal text-black md:text-5xl dark:text-white">{title}</h1>
      {subtitle && (
        <h2 className="dot-font font-doto text-sm tracking-widest text-black/40 uppercase dark:text-white/80">
          {subtitle}
        </h2>
      )}
    </div>
  );
}
