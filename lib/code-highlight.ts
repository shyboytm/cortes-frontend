import { codeToHtml } from "shiki";

const SHIKI_THEMES = { light: "github-light", dark: "github-dark" } as const;

export async function highlightCode(code: string, language?: string): Promise<string> {
  const lang = language?.trim() || "plaintext";

  try {
    return await codeToHtml(code, { lang, themes: SHIKI_THEMES });
  } catch {
    return await codeToHtml(code, { lang: "plaintext", themes: SHIKI_THEMES });
  }
}
