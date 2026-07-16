import Link from "next/link";
import { type SanityDocument } from "next-sanity";
import { client } from "@/sanity/client";
import { urlFor } from "@/sanity/image";

const CLIENTS_QUERY = `*[
  _type == "client"
] | order(order asc, _createdAt asc){
  _id, name, url, displaySize,
  logo{ alt, asset }
}`;

const options = { next: { revalidate: 30 } };

// Self-contained (fetches its own data) so it can be dropped into any page
// with no query wiring at the call site — same idea as PrimaryFooter's own
// Last.fm fetch. Renders nothing at all (no heading, no border) if there's
// no client data yet, so an empty Sanity dataset never leaves a stray
// section-shaped gap on the page.
//
// Logos are forced to a flat monochrome silhouette (grayscale + brightness
// crushed to 0) regardless of whatever colors the uploaded logo actually
// has, then inverted in dark mode — so every logo, whether it's a plain
// black mark or a colorful brand logo, ends up as a single dark shape in
// light mode and a single light shape in dark mode instead of staying a
// fixed color that might go invisible against one of the two themes. A
// plain <img> rather than next/image, since these are commonly uploaded as
// SVGs and next/image's optimizer refuses remote SVGs without
// dangerouslyAllowSVG.
//
// All logos are constrained to the same base height, but that alone
// doesn't guarantee they *look* the same size — a dense wordmark (e.g.
// "Uber") reads visually bigger than a compact icon+wordmark lockup at the
// same pixel height. `displaySize` is a per-client manual nudge for
// balancing that out, since there's no reliable way to measure a logo's
// "visual weight" automatically.
//
// The nudge is applied via the actual `height` (through a --logo-h custom
// property so it still respects the responsive h-6/h-8 base), not a CSS
// `transform: scale`. Transform only repaints the element visually — it
// doesn't change the box it occupies in layout — so a transformed logo
// would still leave its *surrounding link* sized (and hoverable/clickable)
// as if at 100%, out of sync with what's actually drawn on screen.
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
            /* eslint-disable-next-line @next/next/no-img-element -- these
               are commonly uploaded as SVGs, and next/image's optimizer
               refuses to process remote SVGs without dangerouslyAllowSVG. */
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
