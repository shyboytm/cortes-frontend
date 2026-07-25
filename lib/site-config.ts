// Single source of truth for the absolute production URL, used to build
// metadataBase (so relative OG/twitter image paths resolve correctly),
// canonical page URLs, and the share-link URLs on Writing posts.
export const SITE_URL = "https://cortes.us";

export const SITE_NAME = "Dennis Cortés";

// Falls back to a real photo already used elsewhere on the site (the About
// page's portrait) rather than a generated placeholder graphic, so every
// page has a decent link-preview image from day one, even before a
// per-page override is set in Sanity or a Blog/Work post has its own image.
export const DEFAULT_OG_IMAGE = `${SITE_URL}/info-portrait-dennis-cortes.jpeg`;
