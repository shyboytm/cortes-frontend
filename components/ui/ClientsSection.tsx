import Image from "next/image";
import Link from "next/link";
import { type SanityDocument } from "next-sanity";
import { client } from "@/sanity/client";
import { urlFor } from "@/sanity/image";

const CLIENTS_QUERY = `*[
  _type == "client"
] | order(order asc, _createdAt asc){
  _id, name, url,
  logo{ alt, asset }
}`;

const options = { next: { revalidate: 30 } };

// Self-contained (fetches its own data) so it can be dropped into any page
// with no query wiring at the call site — same idea as PrimaryFooter's own
// Last.fm fetch. Renders nothing at all (no heading, no border) if there's
// no client data yet, so an empty Sanity dataset never leaves a stray
// section-shaped gap on the page.
//
// Logos sit muted (grayscale, dimmed) until hovered — a quiet trust-signal
// row rather than a second thing competing for attention with the actual
// work above/below it.
export default async function ClientsSection() {
  const clients = await client.fetch<SanityDocument[]>(CLIENTS_QUERY, {}, options);
  const withLogos = clients.filter((c) => c.logo?.asset);

  if (withLogos.length === 0) return null;

  return (
    <div className="mt-14 border-t border-black/10 pt-8 dark:border-white/10">
      <h2 className="dot-font mb-6 font-doto text-xs tracking-widest text-black/60 uppercase dark:text-white/60">
        / Clients
      </h2>
      <div className="flex flex-wrap items-center gap-x-10 gap-y-6">
        {withLogos.map((c) => {
          const logo = (
            <Image
              src={urlFor(c.logo.asset).height(80).fit("max").url()}
              alt={c.logo.alt || c.name}
              width={160}
              height={40}
              className="h-8 w-auto object-contain grayscale opacity-60 transition-all duration-200 hover:grayscale-0 hover:opacity-100 sm:h-10"
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
