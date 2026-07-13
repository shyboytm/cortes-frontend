import { type SanityDocument } from "next-sanity";
import { client } from "@/sanity/client";
import PrimaryNav from "@/components/ui/PrimaryNav";
import WorkRow from "@/components/ui/WorkRow";

const WORK_QUERY = `*[
  _type == "work"
  && defined(slug.current)
]|order(order asc, _createdAt desc){
  _id,
  title,
  dateRange,
  slug,
  mainImage{
    alt,
    asset
  },
  hoverImage{
    alt,
    asset
  },
  "hasCaseStudy": count(caseStudy) > 0
}`;

const options = { next: { revalidate: 30 } };

export default async function WorkIndexPage() {
  const workItems = await client.fetch<SanityDocument[]>(WORK_QUERY, {}, options);

  return (
    <div className="pt-32 pb-24">
      <PrimaryNav />

      <div className="px-12">
        <div className="flex flex-col items-start gap-2 pb-10">
          <h1 className="text-4xl font-normal text-black md:text-5xl dark:text-white">Work</h1>
          <h2 className="dot-font font-doto text-sm tracking-widest text-black/40 uppercase dark:text-white/80">
            Software Product Designer
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {workItems.map((work) => (
            <WorkRow
              key={work._id}
              title={work.title}
              dateRange={work.dateRange}
              mainImage={work.mainImage}
              hoverImage={work.hoverImage}
              slug={work.slug?.current}
              hasCaseStudy={work.hasCaseStudy}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
