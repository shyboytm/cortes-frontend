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

// Shared `block.h2`/`block.h3` renderers for Sanity PortableText bodies —
// identical heading treatment across case studies and blog posts.
export const portableTextHeadings: Record<"h2" | "h3", PortableTextBlockComponent> = {
  h2: ({ children }) => (
    <h2 className="mt-10 mb-4 text-2xl font-normal tracking-wide text-black dark:text-white">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-8 mb-3 text-xl font-normal tracking-wide text-black dark:text-white">{children}</h3>
  ),
};
