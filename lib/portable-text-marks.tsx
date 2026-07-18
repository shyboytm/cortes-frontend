import { type PortableTextMarkComponent, type PortableTextBlockComponent } from "@portabletext/react";

// Shared `marks.link` renderer for Sanity PortableText bodies (case studies,
// blog posts, etc). Renders an external link with target=_blank/rel, and an
// internal link as a plain in-app anchor — both get the same underline style.
export const portableTextLinkMark: PortableTextMarkComponent = ({ value, children }) => {
  const href = value?.href || "#";
  const isExternal = /^https?:\/\//.test(href);
  return (
    <a
      href={href}
      className="link-underline opacity-50"
      {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {children}
    </a>
  );
};

// Shared `block.h1`-`block.h6` renderers for Sanity PortableText bodies —
// identical heading treatment across case studies and blog posts. Capped to
// a max-w-3xl reading column and centered so headings stay legible even
// inside a wide page container (e.g. the Work case study page, whose outer
// container is max-w-7xl to leave room for full/wide/offset image bleed).
export const portableTextHeadings: Record<"h1" | "h2" | "h3" | "h4" | "h5" | "h6", PortableTextBlockComponent> = {
  h1: ({ children }) => (
    <h1 className="mx-auto mt-12 mb-6 max-w-3xl text-3xl font-normal tracking-wide text-black dark:text-white">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="mx-auto mt-10 mb-4 max-w-3xl text-2xl font-normal tracking-wide text-black dark:text-white">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mx-auto mt-8 mb-3 max-w-3xl text-xl font-normal tracking-wide text-black dark:text-white">
      {children}
    </h3>
  ),
  h4: ({ children }) => (
    <h4 className="mx-auto mt-6 mb-2 max-w-3xl text-base font-normal tracking-wide text-black dark:text-white">
      {children}
    </h4>
  ),
  h5: ({ children }) => (
    <h5 className="mx-auto mt-6 mb-2 max-w-3xl text-sm font-normal tracking-widest text-black/80 uppercase dark:text-white/80">
      {children}
    </h5>
  ),
  h6: ({ children }) => (
    <h6 className="mx-auto mt-4 mb-2 max-w-3xl text-xs font-normal tracking-widest text-black/60 uppercase dark:text-white/60">
      {children}
    </h6>
  ),
};
