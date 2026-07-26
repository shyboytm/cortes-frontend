import Link from "next/link";
import { type SanityDocument } from "next-sanity";
import { client, sanityFetchOptions } from "@/sanity/client";
import { urlFor } from "@/sanity/image";

const CLIENTS_QUERY = `*[
  _type == "client"
] | order(order asc, _createdAt asc){
  _id, name, url, displaySize,
  logo{ alt, asset }
}`;

const options = sanityFetchOptions(900);

export default async function ClientsSection() {
  const clients = await client.fetch<SanityDocument[]>(CLIENTS_QUERY, {}, options);
  const withLogos = clients.filter((c) => c.logo?.asset);

  if (withLogos.length === 0) return null;

  return (
    <div className="mt-14 border-t border-black/10 pt-8 dark:border-white/10">
      <h2 className="dot-font mb-6 font-doto text-xs tracking-widest text-black/60 uppercase dark:text-white/60">
        / Select Clients
      </h2>
      <div className="flex flex-wrap items-center gap-x-10 gap-y-6">
        {withLogos.map((c) => {
          const scale = c.displaySize ?? 1;

          const logo = (
            <img
              src={urlFor(c.logo.asset).height(80).fit("max").url()}
              alt={c.logo.alt || c.name}
              width={100}
              height={80}
              style={{ height: `calc(var(--logo-h) * ${scale})` }}
              className="w-auto object-contain grayscale brightness-0 opacity-60 transition-opacity duration-200 hover:opacity-100 dark:invert [--logo-h:1.5rem] sm:[--logo-h:2rem]"
            />
          );

          return c.url ? (
            <Link key={c._id} href={c.url} target="_blank" rel="noopener noreferrer">
              {logo}
            </Link>
          ) : (
            <div key={c._id}>{logo}</div>
          );
        })}
      </div>
    </div>
  );
}
