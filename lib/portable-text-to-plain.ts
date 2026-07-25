// Flattens a Portable Text body/caseStudy array down to a plain-text
// snippet suitable for a meta description: joins every plain text block's
// spans (skipping images, videos, video embeds, and offset/end-offset
// markers, which contribute no text of their own), collapses whitespace,
// and truncates at a word boundary once it passes maxLength.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function portableTextToPlainText(blocks: any[] | undefined, maxLength = 160): string {
  if (!Array.isArray(blocks)) return "";

  const text = blocks
    .filter((block) => block?._type === "block" && Array.isArray(block.children))
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((block) => block.children.map((child: any) => child?.text || "").join(""))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  if (text.length <= maxLength) return text;

  const truncated = text.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");
  return `${(lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated).trim()}…`;
}
