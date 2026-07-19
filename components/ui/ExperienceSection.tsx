import Link from "next/link";
import { type SanityDocument } from "next-sanity";
import { client, sanityFetchOptions } from "@/sanity/client";
import { urlFor } from "@/sanity/image";

const EXPERIENCE_QUERY = `*[
  _type == "experience"
] | order(order asc, _createdAt asc){
  _id, company, role, period, url,
  logo{ alt, asset }
}`;

const options = sanityFetchOptions(900);

export default async function ExperienceSection() {
  const items = await client.fetch<SanityDocument[]>(EXPERIENCE_QUERY, {}, options);
  const withLogos = items.filter((item) => item.logo?.asset);

  if (withLogos.length === 0) return null;

  return (
    <div className="mt-14 border-t border-black/10 pt-8 dark:border-white/10">
      <h2 className="mt-6 mb-12 text-2xl font-normal tracking-wide text-black dark:text-white">
        Where I've Worked
      </h2>

      <div className="-mx-6 overflow-x-auto px-6 pb-2 lg:mx-0 lg:overflow-visible lg:px-0">
        <div className="relative min-w-max lg:min-w-0">
          <div className="pointer-events-none absolute inset-x-0 top-3 h-px bg-black/10 dark:bg-white/10" />

          <div className="grid grid-flow-col auto-cols-[104px] gap-x-6 lg:auto-cols-fr lg:gap-x-4">
            {withLogos.map((item) => {
              const content = (
                <div className="hover:opacity-50 duration-250 ease-in-out flex flex-col items-center gap-3 text-center">
                  <span className="relative z-10 flex h-6 shrink-0 items-center rounded-full bg-black/80 px-3 text-[11px] font-bold tracking-widest whitespace-nowrap text-white uppercase dark:bg-white/80 dark:text-black">
                    {item.period}
                  </span>
                  <div className="h-6 w-px bg-black/15 dark:bg-white/15" />
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full border border-black/10 bg-black/5 dark:border-white/10 dark:bg-white/5">
                    <img
                      src={urlFor(item.logo.asset).width(128).height(128).fit("crop").url()}
                      alt={item.logo.alt || item.company}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-black dark:text-white">{item.company}</p>
                    <p className="text-xs text-black/60 dark:text-white/60">{item.role}</p>
                  </div>
                </div>
              );

              return item.url ? (
                <Link key={item._id} href={item.url} target="_blank" rel="noopener noreferrer">
                  {content}
                </Link>
              ) : (
                <div key={item._id}>{content}</div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
