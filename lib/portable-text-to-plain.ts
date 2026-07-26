type PlainTextBlock = { _type?: string; children?: Array<{ text?: string }> };

export function portableTextToPlainText(blocks: unknown[] | undefined, maxLength = 160): string {
  if (!Array.isArray(blocks)) return "";

  const text = (blocks as PlainTextBlock[])
    .filter((block) => block?._type === "block" && Array.isArray(block.children))
    .map((block) => block.children!.map((child) => child?.text || "").join(""))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  if (text.length <= maxLength) return text;

  const truncated = text.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");
  return `${(lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated).trim()}…`;
}
